const baseURL = "http://localhost:3001/api/"


async function Login(email, password) {
    const response = await fetch(baseURL + 'sessions',
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: email, password: password })
        }
    );
    if (response.ok) {
        const user = await response.json();
        return user; 
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error("Something went wrong")
    }
}


async function logout() {
    const response = await fetch(baseURL + 'sessions/current',
        {
            method: "DELETE",
            credentials: "include",
           
        }
    );
    if (response.ok) {
       
        return true; 
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error("Something went wrong")
    }
}
async function createNewBudget(amount) {
    const response = await fetch(baseURL + 'budget',
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ year: 2024, amount: amount, phase: 1})
        }
    );
    if (response.ok) {
        const res = await response.json();
        return res; 
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error("Something went wrong")
    }
}


async function getBudget() {
    const response = await fetch (baseURL + 'budgets/current', {credentials: "include"});
    if(response.ok) {
        const res = await response.json();
        return res;
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error ("Something went wrong")
    }
}

async function getCurrentPhase() {
    const response = await fetch (baseURL + 'budgets/phase/current', {credentials: "include"});
    if(response.ok) {
        const res = await response.json();
        return res;
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error ("Something went wrong")
    }
}



async function getCurrentUser() {
    const response = await fetch (baseURL + 'sessions/current', {credentials: "include"});
    if(response.ok) {
        const res = await response.json();
        return res;
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error ("Something went wrong")
    }
}

async function getUserProposals() {
    const response = await fetch (baseURL + 'user/proposals', {credentials: "include"});
    if(response.ok) {
        const res = await response.json();
        return res;
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error ("Something went wrong")
    }
}



async function addProposal(proposal) {
    const response = await fetch(baseURL + 'proposals',
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ description: proposal.description, cost: proposal.cost })
        }
    );
    if (response.ok) {
        const res = await response.json();
        return res; 
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error("Something went wrong")
    }
}

async function updateProposal(proposal) {
    const response = await fetch(baseURL + 'proposals/' + proposal.proposal_id ,
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ description: proposal.description, cost: proposal.cost })
        }
    );
    if (response.ok) {
        const res = await response.json();
        return res; 
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error("Something went wrong")
    }
}


async function deleteProposal(proposal_id) {
    const response = await fetch(baseURL + 'proposals/' + proposal_id ,
        {
            method: "DELETE",
            credentials: "include"      
        }
    );
    if (response.ok) {
        const res = await response.json();
        return res; 
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error("Something went wrong")
    }
}




async function settingPhase() {
    const response = await fetch(baseURL + 'budget/phase',
        {
            method: "PUT",
            credentials: "include",
         
        }
    );
    if (response.ok) {
        const res = await response.json();
        return res; 
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error("Something went wrong")
    }
}



async function getAllProposals() {
    const response = await fetch (baseURL + 'proposals/votes', {credentials: "include"});
    if(response.ok) {
        const res = await response.json();
        return res;
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error ("Something went wrong")
    }
}



async function addPreference(score, proposal_id) {
    const response = await fetch(baseURL + 'preferences',
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({score, proposal_id})
        }
    );
    if (response.ok) {
        const res = await response.json();
        return res; 
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error("Something went wrong")
    }
}


async function deletePreference(proposal_id) {
    const response = await fetch(baseURL + 'preferences/delete/' + proposal_id ,
        {
            method: "DELETE",
            credentials: "include"      
        }
    );
    if (response.ok) {
        const res = await response.json();
        return res; 
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error("Something went wrong")
    }
}



// ********************************************************

async function getApprovedProposals() {
    const response = await fetch (baseURL + 'approved-proposals', {credentials: "include"});
    if(response.ok) {
        const res = await response.json();
        return res;
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error ("Something went wrong")
    }
}


async function getNonApprovedProposals() {
    const response = await fetch (baseURL + 'non-approved-proposals', {credentials: "include"});
    if(response.ok) {
        const res = await response.json();
        return res;
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error ("Something went wrong")
    }
}




async function restart() {
    const response = await fetch(baseURL + 'restart',
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ })
        }
    );
    if (response.ok) {
        const res = await response.json();
        return res; 
    } else {
        const error = await response.json();
        if (error.error) throw error.error;
        if (error.message) throw error.message;

        throw new Error("Something went wrong")
    }
}


const API = { Login,logout, getBudget, getCurrentPhase, getCurrentUser, createNewBudget, getUserProposals, addProposal, updateProposal, deleteProposal, settingPhase, getAllProposals, addPreference, deletePreference, getApprovedProposals, getNonApprovedProposals, restart };
export default API;

