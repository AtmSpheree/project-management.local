import { useEffect, useState, useContext } from "react";
import { Row, Col, Image, Alert, Form, Button, Container } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function AddContractor() {
  const navigator = useNavigate();
  const params = useParams();
  const dataContext = useContext(DataContext);
  const location = useLocation();
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState(null);
  const [isFormShown, setIsFormShown] = useState(false);
  const [isAlert, setIsAlert] = useState(false);

  const [fields, setFields] = useState({
    contractor: '',
  });
  const [errors, setErrors] = useState({
    contractor: [],
  });
  
  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    } else if (dataContext.data?.profile.role !== "admin") {
      navigator('/');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function doActions() {
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
        } else {
          setIsFormShown(true);
          let response = await data.json();
          setTask({
            users: response.data.users
          })
        }
      } catch (e) {

      }

      try {
        let data = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (data.status === 401) {
          localStorage.removeItem('token');
          dataContext.setData({
            ...dataContext.data,
            profile: null
          });
          navigator('/login')
        } else {
          setIsFormShown(true);
          let response = await data.json();
          if (response.data.length == 0) {
            if (location.state && location.state.prev) {
              navigator(location.state.prev)
            } else {
              navigator(`/`);
            }
          } else {
            setUsers(response.data)
            setFields({...fields, contractor: response.data[0].id})
          }
        }
      } catch (e) {

      }
    }

    doActions();
  }, [])

  const onFormSubmit = async (e) => {
    e.preventDefault();
    console.log(fields)
    try {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${params.taskId}/${fields.contractor}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
      if (data.status === 401) {
        localStorage.removeItem('token');
        dataContext.setData({
          ...dataContext.data,
          profile: null,
        });
        navigator('/login')
      } else {
        if (location.state && location.state.prev) {
          navigator(location.state.prev)
        } else {
          navigator(`/projects`);
        }
      }
    } catch (e) {

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
    {((params.userId && isFormShown === true) || (!params.userId)) &&
      <Container className="mt-4" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">Добавление исполнителя</h2>
        <Form onSubmit={onFormSubmit}>
          <Form.Group controlId="contractor" className="mb-3">
            <Form.Label>Исполнитель</Form.Label>
            <Form.Select
              aria-label="Contractor"
              onChange={(e) => setFields({...fields, contractor: e.target.value})}
              value={fields.contractor}
              type="text"
              placeholder="Выберите исполнителя"
              required
              isInvalid={errors.contractor.length > 0}
            >
              {(users !== null && task !== null) &&
              users.filter(item => task.users.filter(two_item => two_item.id == item.id).length == 0).map(item => <option key={item.id} value={item.id}>
                {item.fullname}
              </option>)}
            </Form.Select>
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100 mb-3">
            Добавить
          </Button>
        </Form>
      </Container>
    }
  </>)
}