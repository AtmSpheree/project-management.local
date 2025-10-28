import { useEffect, useState, useContext } from "react";
import { Row, Col, Image, Alert, Form, Button, Container } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function ChangeStatus() {
  const navigator = useNavigate();
  const params = useParams();
  const [task, setTask] = useState(null);
  const dataContext = useContext(DataContext);
  const location = useLocation();
  const [isFormShown, setIsFormShown] = useState(false);
  const [isAlert, setIsAlert] = useState(false);

  const [fields, setFields] = useState({
    status: ''
  });
  const [errors, setErrors] = useState({
    status: []
  });
  
  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function doActions() {
      if (params.taskId) {
        try {
          let data = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${params.taskId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (data.status === 404) {
            setIsFormShown({error: true, message: 'Такой задачи не существует.'});
          } else if (data.status === 401) {
            localStorage.removeItem('token');
            dataContext.setData({
              ...dataContext.data,
              profile: null
            });
            navigator('/login')
          } else if (data.status === 403) {
            setIsFormShown({error: true, message: 'У вас нет доступа.'});
          } else {
            setIsFormShown(true);
            let response = await data.json();
            setTask({
              status: response.data.status
            })
            setFields({
              status: response.data.status
            })
          }
        } catch (e) {

        }
      }
    }

    doActions();
  }, [])

  const checkSimilarity = () => {
    if (task === null) {
      return true;
    }
    if (fields.status === task.status) {
      return true;
    }
    return false;
  }

  const onChangeFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${params.taskId}/change_status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          status: fields.status,
        })
      });
      if (data.status === 401) {
        localStorage.removeItem('token');
        dataContext.setData({
          ...dataContext.data,
          profile: null
        });
        navigator('/login')
      } else if (data.status === 422) {
        let response = await data.json();
        setErrors({
          status: [],
          ...response.errors
        });
      } else {
        let response = await data.json();
        setTask({
          status: response.data.status,
        })
        setErrors({
          status: []
        });
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 2000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (<>
    {isFormShown.error &&
      <Container
        className="d-flex justify-content-center align-items-center"
      >
        <div className="text-center">
          <h1>{isFormShown.message}</h1>
        </div>
      </Container>
    }
    {isFormShown === true &&
      <Container className="mt-4" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">Редактирование статуса задачи</h2>
        <Form onSubmit={onChangeFormSubmit}>
          <Form.Group controlId="status" className="mb-3">
            <Form.Label>Статус</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, status: e.target.value})}
              value={fields.status}
              type="text"
              placeholder="Укажите статус"
              required
              isInvalid={errors.status.length > 0}
            />
            {errors.status.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {!checkSimilarity() &&
            <Button variant="primary" type="submit" className="w-100" style={{marginBottom: '10px'}}>
              Редактировать запись
            </Button>
          }

          {isAlert &&
            <Alert variant='success'>
              Запись успешно отредактирована.
            </Alert>
          }
        </Form>
      </Container>
    }
  </>)
}