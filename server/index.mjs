import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { check, validationResult } from 'express-validator';
import SBDao from './dao-SB.mjs';
import UserDao from './dao-users.mjs'

import { Budget, Preference } from './SBModels.mjs';

const userDao = new UserDao();

/*** init express and set up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());


/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true
};
app.use(cors(corsOptions));



/*** Passport ***/

/** Authentication-related imports **/
import passport from 'passport';                              
import LocalStrategy from 'passport-local';                


passport.use(new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUserByCredentials(username, password)
    if(!user)
      return callback(null, false, 'Incorrect username or password');

    return callback(null, user); 
}));


passport.serializeUser(function (user, callback) { 
    callback(null, user);
});


passport.deserializeUser(function (user, callback) { 
    return callback(null, user); 

});


/** Creating the session */
import session from 'express-session';

app.use(session({
  secret: "This is a very secret information used to initialize the session!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));




/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({error: 'Not authorized'});
}


/*** Utility Functions ***/

// This function is used to handle validation errors
const onValidationErrors = (validationResult, res) => {
    const errors = validationResult.formatWith(errorFormatter);
    return res.status(422).json({validationErrors: errors.mapped()});
};

// Only keep the error message in the response
const errorFormatter = ({msg}) => {
    return msg;
};


/*** Users APIs ***/

// POST /api/sessions
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
        if (!user) {
   
          return res.status(401).json({ error: info});
        }

        req.login(user, (err) => {
          if (err)
            return next(err);


          return res.json(req.user);
        });
    })(req, res, next);
  });

  // GET /api/sessions/current
  // This route checks whether the user is logged in or not.
  app.get('/api/sessions/current', (req, res) => {
    if(req.isAuthenticated()) {
      res.status(200).json(req.user);}
    else
      res.status(401).json({error: 'Not authenticated'});
  });

  // DELETE /api/session/current
  // This route is used for loggin out the current user.
  app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
      res.end();
    });
  });



/***************************************************************************************************** */
/*** Budget APIs ***/


//Create New Budget (only by admin)
app.post('/api/budget', [
  check('year').isInt({min: 2023}),
  check('amount').isFloat({ min: 0 }),
  check('phase').equals('1')
], async (req, res) => {

  const invalidFields = validationResult(req);
  if(!invalidFields.isEmpty()) {
    return onValidationErrors(invalidFields, res);
  }

    const year = req.body.year;
    const amount = req.body.amount;
    const phase = req.body.phase ? req.body.phase : 1;
    const budget = new Budget(undefined, year, amount, phase);
  try{
    const result = await SBDao.createNewBudget(budget);
    res.status(201).json(result);
  } catch (err) {
    res.status(503).json({error: `Database error during the creation of new budget: ${err}`})
  }

});


//Get Budget
app.get('/api/budgets/current', async (req, res) => {
  try {
    const result = await SBDao.getBudget();
    res.json(result);
  } catch (err) {
    res.status(500).json({error: `Database error during the retrieval of the current budget: ${err}`})
  }
});


//Get Current Phase 
app.get('/api/budgets/phase/current', async (req, res) => {
  try {
    const result = await SBDao.getCurrentPhase();
    res.json(result);
  } catch (err) {
    res.status(500).json({error: `Database error during the retrieval of the current budget: ${err}`})
  }
});


// Setting Phase
app.put('/api/budget/phase', isLoggedIn, async (req, res) => {
  const invalidFields = validationResult(req);
  if(!invalidFields.isEmpty()) {
    return onValidationErrors(invalidFields, res);
  }

  try {
    const result = await SBDao.settingPhase();
    if (result.error)
        res.status(404).json(result);
    else
        res.json(result);
} catch (err) {
    res.status(503).json({ error: `Database error during the setting phase: ${err}` });
}
 
});


// Delete Budget
app.delete('/api/budget', isLoggedIn, async (req, res) => {
  try{
    const result = await SBDao.deleteBudget();
    if (result === 0) {
      res.status(404).json({ error: 'Budget not found' });
    } else {
      res.status(200).json({ message: 'Budget deleted successfully' });
    }
    } catch (err) {
      res.status(500).json({ error: `Database error during the budget deletion: ${err}` });
  }

});

/***************************************************************************************************** */
/*** Proposal APIs ***/

//Add Proposal
app.post('/api/proposals', isLoggedIn, [
  check('description').isString().notEmpty(),
  check('cost').isFloat({ min: 0})
],
  async (req, res) => {
    

    const description = req.body.description;
    const cost = req.body.cost;
   const proposal = {
    description,
    cost
   }

    try{
      const result = await SBDao.addProposal(proposal, req.user);
      res.json(result);
    } catch (err) {
      res.status(503).json({error: `Database error during the addition of proposal: ${err}`});
    }
});





// Get User Proposals by user id 
app.get('/api/user/proposals', isLoggedIn, 
  (req, res) => {
    SBDao.getUserProposals(req.user.id)
    .then(proposals => res.json(proposals))
    .catch((err) => res.status(500).json(err)); 
});




// Update Proposal
app.put('/api/proposals/:proposal_id', isLoggedIn, [
  check('description').isString().notEmpty(),
  check('cost').isFloat({ min: 0 })
], async (req, res) => {
  
  const invalidFields = validationResult(req);
  if(!invalidFields.isEmpty()) {
    return onValidationErrors(invalidFields, res);
  }
  const description = req.body.description;
  const cost = req.body.cost;
  // const proposal = new Proposal(Number(req.params.proposal_id), req.body.description, req.body.cost, req.user);
  const proposal = {
    description,
    cost,
    proposal_id: req.params.proposal_id
   }
  
  try {
      const result = await SBDao.updateProposal(req.user, proposal);
      if (result.error)
          res.status(404).json(result);
      else
          res.json(result);
  } catch (err) {
      res.status(503).json({ error: `Database error during the update of proposal ${req.params.id}: ${err}` });
  }
});



// Delete a Proposal
app.delete('/api/proposals/:proposal_id', isLoggedIn, async (req, res) => {
  try {
      const proposal_id = req.params.proposal_id;
      const result = await SBDao.deleteProposal(req.user, proposal_id);
      if (result.error)
        res.status(404).json(result);
    else
        res.json(result);
}catch (err) {
      res.status(500).json({ error: `Database error during the deletion of proposal ${err}` });
  }
});



// Get All Proposals
app.get('/api/proposals/votes', isLoggedIn, 
  (req, res) => {
    SBDao.getAllProposals(req.user)
    .then(proposals => res.json(proposals))
    .catch((err) => res.status(500).json(err)); 
});






// Get Budget Amount by budget id
app.get('/api/budgets/:budget_id/amount', isLoggedIn, async (req, res) => {
  const budget_id = req.params.budget_id;
  try {
    const result = await SBDao.getBudgetAmount(budget_id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Database error during the retrieval of budget amount: ${err}` });
  }
});



// Get Approved Proposals
app.get('/api/approved-proposals', async (req, res) => {
  try {
    const result = await SBDao.getApprovedProposals();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Database error during the retrieval of approved proposals: ${err}` });
  }
});



//Get Non-approved Proposals
app.get('/api/non-approved-proposals', isLoggedIn, async (req, res) => {
  try {
    const result = await SBDao.getNonApprovedProposals();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Database error during the retrieval of non-approved proposals: ${err}` });
  }
});




/***************************************************************************************************** */
/*** Preference APIs ***/


// Add Preference
app.post('/api/preferences', isLoggedIn, [
  check('score').isInt({ min: 1, max: 3 })
], async (req, res) => {
  const invalidFields = validationResult(req);
  if (!invalidFields.isEmpty()) {
    return onValidationErrors(invalidFields, res);
  }


  const score = req.body.score ? req.body.score : 0;
  const proposal_id = req.body.proposal_id;
  const preference = new Preference(undefined, score, req.user, proposal_id)

  try {
      const result = await SBDao.addPreference(preference,req.user);
      res.json(result);
  } catch (err) {
      res.status(503).json({ error: `Database error during the addition of preference: ${err}` });
  }
});





// Deletes a preference.
app.delete('/api/preferences/delete/:proposal_id', isLoggedIn, async (req, res) => {
  try {
      const proposal_id = req.params.proposal_id;
      const result = await SBDao.deletePreference(req.user, proposal_id);
      if (result.error)
        res.status(404).json(result);
    else
        res.json(result);
    }catch (err) {
          res.status(500).json({ error: `Database error during the deletion of the preference: ${err}` });
  }
});







app.post('/api/restart', isLoggedIn, async (req, res) => {

  try {
      const result = await SBDao.restart();
      res.json(result);
  } catch (err) {
      res.status(503).json({ error: `Database error during the addition of preference: ${err}` });
  }
});

/***************************************************************************************************** */
/***************************************************************************************************** */
// activate the server

const port = 3001;

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});