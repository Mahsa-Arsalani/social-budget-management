import { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import API from '../API.mjs';

const Results = (props) => {

  const [approvedProposals, setApprovedProposals] = useState([]);
  const [nonApprovedProposals, setNonApprovedProposals] = useState([]);




  const fetchLists = async () => {
    API.getApprovedProposals().then(response => setApprovedProposals(response));
    API.getNonApprovedProposals().then(response => setNonApprovedProposals(response));
  };


  useEffect(() => {
    fetchLists();
  }, [])



  const handleRestart = async () => {
    API.restart().then(() => {
      props.getCurrentProject();
    });

  };



  return (
    <div>
      <h2>Results</h2>


      <h3>Approved Proposals</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Cost</th>
            <th>Author</th>
            <th>Total Score</th>
          </tr>
        </thead>
        <tbody>
          {approvedProposals.map((item, index) => <tr key={item.proposal_id}>
            <td>{index + 1}</td>
            <td>{item.description}</td>
            <td>{item.cost} <span>&#8364;</span></td>
            <td>{item.name}</td>
            <td>{item.total_score}</td>
          </tr>
          )}
        </tbody>
      </Table>




      <h3 className="mt-4">Non-Approved Proposals</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Cost</th>
            <th>Total Score</th>
          </tr>
        </thead>
        <tbody>
          {nonApprovedProposals.map((item, index) => <tr key={item.proposal_id}>
            <td>{index + 1}</td>
            <td>{item.description}</td>
            <td>{item.cost} <span>&#8364;</span></td>
            <td>{item.total_score}</td>
          </tr>
          )}
        </tbody>
      </Table>


      {props.user?.is_admin == 1 && <button className="btn btn-primary btn-sm float-end" onClick={() => handleRestart()}>Restart</button>}

    </div>
  );
};

export default Results;