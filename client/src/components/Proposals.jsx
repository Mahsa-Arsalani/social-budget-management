import { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import API from '../API.mjs';


const Proposals = (props) => {
  const [proposals, setProposals] = useState([]);
  const [proposal_id, setProposalId] = useState();
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [definedBudget, setDefinedBudget] = useState();
  const [costError, setCostError] = useState('');




  const fetchProposals = async () => {
    API.getUserProposals().then(response => setProposals(response));
  };

  useEffect ( () => {
    fetchProposals();
  }, [])




  useEffect ( () => {
    API.getBudget().then((response) => {
      setDefinedBudget(response.amount);
    })
  }, [])


  const handleAddProposal = async (event) => {
    event.preventDefault();
    if(cost <= definedBudget) {
      if(!editMode){API.addProposal({description, cost}).then(()=>{fetchProposals();
        clearState();
       });} else {
        API.updateProposal({description, cost, proposal_id}).then(()=>{fetchProposals();
          clearState();
          setEditMode(false);
         });
       }
       setCostError("");
    }else {
      setCostError("cost can not be higher than the budget defined");
    }
  };


  const clearState = () => {
    setCost('');
    setDescription('');
  }


  const handleCancel = () => {
    clearState();
    setEditMode(false);
  };


  const handleEditProposal = async (proposal) => {
    setEditMode(true);
    setCost(proposal.cost);
    setDescription(proposal.description);
    setProposalId(proposal.proposal_id);
    
  };

  const handleDeleteProposal = async (id) => {
    API.deleteProposal(id).then(()=>{
      fetchProposals();
    })
  };

  const handleSettingPhase= async () => {
    API.settingPhase().then(()=> {
      props.getCurrentProject();
    })  
  };


  return (
    <div>
      <h4>Defined Budget: </h4>
      <p>{definedBudget} <span>&#8364;</span></p>
      <h2>Your Proposals</h2>
      <Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          <th>Cost</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {proposals.map( (proposal, index) => 
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{proposal.description}</td>
          <td>{proposal.cost} <span>&#8364;</span></td>
          <td><button id="edit" className="btn btn-warning btn-sm float-end" onClick={() => handleEditProposal(proposal)}>Edit</button>
          <button className="btn btn-danger btn-sm float-end" onClick={() => handleDeleteProposal(proposal.proposal_id)}>Delete</button></td>
        </tr>
        )}
      </tbody>
    </Table>


    {proposals && (proposals.length < 3 || editMode) && <form onSubmit={handleAddProposal}>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Cost (in Euro)</label>
          <input
            type="number"
            className="form-control"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
          {costError ? <p className="text-danger"> {costError} </p> : ''}
        </div>
        <button type="submit" className="btn btn-primary mt-2" > {editMode ? "Edit" : "Add"} Proposal</button>
        <button type="button" className="btn btn-danger mt-2 ms-2" onClick={() => {handleCancel()} }> {editMode ? "Cancel" : "Clear Form"}</button>
      </form>}


      {props.user?.is_admin == 1 && <button className="btn btn-primary btn-sm float-end" onClick={() => handleSettingPhase()}>Terminate Proposal Process</button>}
    </div>
  );
};

export default Proposals;