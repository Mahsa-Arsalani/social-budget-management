import { useState} from "react";
import { Alert, Button, Form } from 'react-bootstrap';
import API from '../API.mjs';


function Budget(props) {

    const [budget, setBudget] = useState("");


      const handleSubmit =  () => {
        API.createNewBudget(budget).then(response => {
          if(response) {
           props.getCurrentProject();
          }
          })
      }


    return (
        <>
    {
        props.user?.is_admin ? <div><Form onSubmit={handleSubmit}>

        <Form.Group className="mb-3" controlId="budget">
          <Form.Label>Budget <span>&#8364;</span></Form.Label>
          <Form.Control
            type="number"
            value={budget}
            onChange={(ev) => setBudget(ev.target.value)}
            required={true}
          />
        </Form.Group>
        <Button className="mt-3" type="submit">Add </Button>
      </Form></div> 
      : <Alert variant="danger"> The proposal phase is still closed.</Alert>
    }
        </>
        )

}

export default Budget;