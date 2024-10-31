
import { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import API from '../API.mjs';

const Home = (props) => {
  const [approvedProposals, setApprovedProposals] = useState([]);


  useEffect(() => {
    API.getApprovedProposals().then(response => setApprovedProposals(response));
  }, [])


  return (
    <>
      <div className="text-center">
        {(props.project?.phase < 3) ?
          <Alert variant="info"> The Proposal definition phase is ongoing.</Alert>
          : <div>
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
          </div>

        }
      </div>
    </>

  );
};

export default Home;