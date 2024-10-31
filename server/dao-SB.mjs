import db from './db.mjs';
import { Preference, Proposal } from './SBModels.mjs';
import { ProposalView } from './SBModels.mjs';

/******************** Budget ******************/

// Create new budget
const createNewBudget = (budget) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO budgets(year, amount, phase) VALUES (?, ?, ?)';
    db.run(sql, [budget.year, budget.amount, budget.phase], function (err) {
      if (err)
        reject(err);
      else {
        resolve(this.lastID);
      }
    });
  });
}



// Get Budget 
const getBudget = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM budgets';
    db.get(sql, (err, row) => {
      if (err)
        reject(err);
      else {
        resolve(row || {
          phase: 0,
          amount: null
        });
      }
    });
  });
}

// Get Current Phase 
const getCurrentPhase = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT phase FROM budgets';
    db.get(sql, (err, row) => {
      if (err)
        reject(err);
      else {
        resolve(row);
      }
    });
  });
}


// Seting phase
const settingPhase = () => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE budgets SET phase = phase+1';
    db.run(sql, (err) => {
      if (err)
        reject(err);
      else {
        resolve(true);
      }
    });
  });
}



// Delete Budget (helper)
const deleteBudget = () => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM budgets';
    db.run(sql, (err) => {
      if (err)
        reject(err);
      else {
        resolve(true);
      }
    });
  });
}


/******************** Proposal ******************/


// Add Proposal
const addProposal = (proposal, user) => {

  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM budgets';
    db.get(sql, function (err, row) {
      if (err)
        reject(err)
      else if (row == undefined) {
        reject(new Error(" Proposal Process is closed Now " + err))
      }
      else if (row.phase == 1) {
        const sqlm = 'INSERT INTO proposals(description, cost, author_id) VALUES (?, ?, ?)';
        db.run(sqlm, [proposal.description, proposal.cost, user.id], function (err) {
          if (err)
            reject(err);
          else {
            resolve(this.lastID);
          }
        });
      }
      else {
        reject(new Error("you can not add new proposal in this phase"))
      }

    })

  });
}





// Get User Proposals by user id 
const getUserProposals = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM proposals WHERE author_id = ?';
    db.all(sql, [id], (err, rows) => {
      if (err)
        reject(err);
      else {
        const proposals = rows.map((p) => new Proposal(p.proposal_id, p.description, p.cost, p.author_id, p.budget_id));
        resolve(proposals);
      }
    });
  });
}




// Update Proposal
const updateProposal = (user, proposal) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE proposals SET description = ?, cost = ? WHERE proposal_id = ? AND author_id= ?';
    db.run(sql, [proposal.description, proposal.cost, proposal.proposal_id, user.id], (err) => {
      if (err) {
        reject(err);
      }
      else
        resolve(proposal);

    });
  });
};



// Delete Proposal
const deleteProposal = (user, proposal_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM Proposals WHERE author_id = ? AND proposal_id = ?';
    db.run(sql, [user.id, proposal_id], (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(true);
      }
    });
  });
};



// Get All Proposals (phase2)
const getAllProposals = async (user) => {
  const proposals = await new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM proposals';
    db.all(sql, (err, rows) => {
      if (err)
        reject(err)
      else {

        resolve(rows);
      }
    });
  });
  const voteRes = proposals.map((proposal) => {
    return new Promise((resolveVote, rejectVote) => {
      const voteSql = "SELECT * FROM preferences WHERE proposal_id =? AND author_id =?"
      db.get(voteSql, [proposal.proposal_id, user.id], (err, row) => {
        if (err) { rejectVote(err) }
        else {
          proposal.score = row ? row.score : 0

          resolveVote(proposal)
        }
      })
    })
  })
  const updatedProposals = await Promise.all(voteRes)
  return updatedProposals
}







// Get All Proposals Ranked by the total of scores (helper) (phase3)
const getAllRankedProposals = async () => {
  const proposals = await new Promise((resolve, reject) => {
    db.all(
      `SELECT p.proposal_id, p.description, p.cost, p.author_id, sum( pr.score) as total_score
       FROM proposals p
       left join preferences pr
	     ON p.proposal_id = pr.proposal_id
	     GROUP BY p.proposal_id
       ORDER BY score DESC`,
      [],
      (err, proposals) => {
        if (err) {
          reject(err);
        } else {
          resolve(proposals);
        }
      }
    );
  });

  return proposals
};








// Get Approved Proposals
const getApprovedProposals = () => {
  return new Promise(async (resolve, reject) => {
    try {

      const rankedProposals = await getAllRankedProposals();

      const getAmountSql = 'SELECT amount FROM budgets';
      const defined_budget = await new Promise((resolve, reject) => {
        db.get(getAmountSql, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });

      const getNameSql = 'SELECT id, name FROM users';
      const names = await new Promise((resolve, reject) => {
        db.all(getNameSql, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      const approvedProposals = [];
      let cumulativeCost = 0;

      for (const proposal of rankedProposals) {
        const name = names.filter(a => a.id == proposal.author_id)?.map(a => a.name)[0];
        const score = (proposal.total_score == null ? 0 : proposal.total_score);
        if (cumulativeCost + proposal.cost <= defined_budget.amount) {
          cumulativeCost += proposal.cost;
          approvedProposals.push(new ProposalView(proposal.proposal_id, proposal.description, proposal.cost, name, score));
        } else {
          break;
        }
      }
      resolve(approvedProposals);
    } catch (err) {
      reject(err);
    }
  });
};



//Get Non-approved Proposals

export const getNonApprovedProposals = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const rankedProposals = await getAllRankedProposals();
      const approvedProposals = await getApprovedProposals();
      const filteredId = approvedProposals.map(item => item.proposal_id)
      const nonApprovedProposals = rankedProposals.filter(p => !filteredId.includes(p.proposal_id)).map(p => ({
        proposal_id: p.proposal_id,
        description: p.description,
        cost: p.cost,
        total_score: (p.total_score == null ? 0 : p.total_score)
      }));

      resolve(nonApprovedProposals);
    } catch (err) {
      reject(err);
    }
  });
};
getNonApprovedProposals()



// Clear Proposals (helper)
const clearProposals = () => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM proposals';
    db.run(sql, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(true);
      }
    });
  });
};


// Clear Preferences (helper)
const clearPreferences = () => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM preferences';
    db.run(sql, (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(true);
      }
    });
  });
};


//Restart
const restart = async () => {
  await deleteBudget();
  await clearProposals();
  await clearPreferences();
  return (true);
}



/******************** Preference ******************/



// Add Preference
const addPreference = (preference, user) => {
  return new Promise((resolve, reject) => {
    const checkSql = 'SELECT score FROM preferences WHERE author_id = ? AND proposal_id = ?';
    db.get(checkSql, [user.id, preference.proposal_id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {

        const updateSql = 'UPDATE preferences SET score = ? WHERE author_id = ? AND proposal_id = ?';
        db.run(updateSql, [preference.score, user.id, preference.proposal_id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        });
      } else {
        const insertSql = 'INSERT INTO preferences(score, author_id, proposal_id) VALUES (?, ?, ?)';
        db.run(insertSql, [preference.score, user.id, preference.proposal_id], function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        });
      }
    });
  });
};





// Revoke / Delete a preference
const deletePreference = (user, proposal_id) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM preferences WHERE author_id = ? AND proposal_id = ?';
    db.run(sql, [user.id, proposal_id], (err) => {
      if (err)
        reject(err);
      else resolve(true);
    });
  });
};




const SBDao = { createNewBudget, getBudget, getCurrentPhase, settingPhase, addProposal, getUserProposals, updateProposal, deleteProposal, getAllProposals, getApprovedProposals, getNonApprovedProposals, addPreference, deletePreference, restart }
export default SBDao;