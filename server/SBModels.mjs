
function Budget (budget_id, year, amount, phase) {
    this.budget_id = budget_id;
    this.year = year;
    this.amount = amount;
    this.phase = phase;
}



function Proposal (proposal_id, description, cost, author_id, budget_id) {
    this.proposal_id = proposal_id;
    this.description = description;
    this.cost = cost;
    this.author_id = author_id;
    this.budget_id = budget_id;

}


function ProposalView (proposal_id, description, cost, name, total_score) {
    this.proposal_id = proposal_id;
    this.description = description;
    this.cost = cost;
    this.name = name;
    this.total_score = total_score;

}


function Preference (preference_id, score, author_id, proposal_id) {
    this.preference_id = preference_id;
    this.score = score;
    this.author_id = author_id;
    this.proposal_id = proposal_id;
}


export { Budget, Proposal, Preference, ProposalView};