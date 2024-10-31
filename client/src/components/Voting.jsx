import { useState, useEffect } from 'react';
import { Table, Dropdown } from 'react-bootstrap';
import API from '../API.mjs';


const Voting = (props) => {
  const [proposals, setProposals] = useState([]);



  const fetchProposals = async () => {
    API.getAllProposals().then(response => setProposals(response));
  };


  useEffect(() => {
    fetchProposals();
  }, [])




    const handleAddScore = async (score, proposal_id) => {
     API.addPreference(score, proposal_id).then(()=> fetchProposals())
    };


    const handleDeleteScore = async (proposal_id) => {
     API.deletePreference(proposal_id).then(()=> fetchProposals())
    };


    const handleSettingPhase= async () => {
      API.settingPhase().then(()=> {
        props.getCurrentProject();
      })  
    };

    
  return (
    <div>
      <h2>Voting</h2>
      <h3>All Proposals</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Cost</th>
            <th>Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map(item => <tr key={item.proposal_id}>
            <td>1</td>
            <td>{item.description}</td>
            <td>{item.cost}</td>
            <td>{item.score}</td>
    
            <td>
              <Dropdown>
                <Dropdown.Toggle disabled = {props.user?.id == item.author_id} variant="success" id="dropdown-basic">
                  Select Score
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item  onClick={() => handleAddScore(1, item.proposal_id)}>1</Dropdown.Item>
                  <Dropdown.Item  onClick={() => handleAddScore(2, item.proposal_id)}>2</Dropdown.Item>
                  <Dropdown.Item  onClick={() => handleAddScore(3, item.proposal_id)}>3</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <button className="btn btn-danger btn-sm float-end" disabled = {props.user?.id == item.author_id} onClick={() => handleDeleteScore(item.proposal_id)}>Delete Score</button></td>
          </tr>
          )}


        </tbody>
      </Table>

      {props.user?.is_admin == 1 && <button className="btn btn-primary btn-sm float-end" onClick={() => handleSettingPhase()}>Terminate Voting Process</button>}

    </div>
  );
};

export default Voting;