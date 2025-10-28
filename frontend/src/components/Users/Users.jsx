import { useEffect, useState, useContext } from "react";
import { Modal, ListGroup, Button, Container, Row, Col, Form } from "react-bootstrap";
import { useNavigate } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function Users() {
  const navigator = useNavigate();
  const [users, setUsers] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const dataContext = useContext(DataContext);
  const [sortNumber, setSortNumber] = useState('По возрастанию');

  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    } else if (dataContext.data?.profile.role !== "admin") {
      navigator('/');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function getData() {
      try {
        let data = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        let response = await data.json();
        setUsers(
          response.data.sort((a, b) => {
            if (a.fullname.toLowerCase() < b.fullname.toLowerCase()) {
              return -1;
            }
            if (a.fullname.toLowerCase() > b.fullname.toLowerCase()) {
              return 1;
            }
            return 0;
          })
        );
      } catch (e) {

      }
    }

    getData();
  }, [])

  const deleteUser = async (e) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/users/${modalShow}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(users.filter(item => item.id !== modalShow))
      setModalShow(false);
    } catch (e) {
      console.log(e)
    }
  }

  const deleteUserModal = (id) => {
    setModalShow(id);
  }

  useEffect(() => {
    if (users !== null) {
      if (sortNumber === 'По убыванию') {
        setUsers(JSON.parse(JSON.stringify(users)).sort((a, b) => {
          if (a.fullname.toLowerCase() < b.fullname.toLowerCase()) {
            return -1;
          }
          if (a.fullname.toLowerCase() > b.fullname.toLowerCase()) {
            return 1;
          }
          return 0;
        }).reverse());
      } else {
        setUsers(JSON.parse(JSON.stringify(users)).sort((a, b) => {
          if (a.fullname.toLowerCase() < b.fullname.toLowerCase()) {
            return -1;
          }
          if (a.fullname.toLowerCase() > b.fullname.toLowerCase()) {
            return 1;
          }
          return 0;
        }));
      }
    }
  }, [sortNumber])

  return (<>
    {users !== null &&
      <Container>
        <h2 className="mb-4">Пользователи</h2>
        <Form style={{marginBottom: 10}}>
          <Col md={2}>
            <Form.Label>Сортировка по ФИО</Form.Label>
            <Form.Select
              value={sortNumber}
              onChange={(e) => {setSortNumber(e.target.value)}}
            >
              <option value='По возрастанию'>По возрастанию</option>
              <option value='По убыванию'>По убыванию</option>
            </Form.Select>
          </Col>
        </Form>
        <Button
          variant="primary"
          size="sl"
          title="Добавить пользователя"
          style={{marginBottom: 10}}
          onClick={(e) => navigator(`/add_user`, {state: {prev: '/equipment_types'}})}
        >Добавить пользователя</Button>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">ФИО</th>
              <th scope="col">E-mail</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(item => <tr>
              <td>{item.fullname}</td>
              <td>{item.email}</td>
              <td className="d-flex justify-content-end" style={{gap: 10}}>
                <Button
                  style={{width: '38px'}}
                  variant="outline-secondary"
                  size="sm"
                  title="Редактировать"
                  onClick={(e) => navigator(`/users/${item.id}`, {state: {prev: '/users'}})}
                >
                  &#9998;
                </Button>
                <Button
                  style={{width: '38px'}}
                  variant="outline-danger"
                  size="sm"
                  title="Удалить"
                  onClick={(e) => deleteUserModal(item.id)}
                >
                  &#10005;
                </Button>
              </td>
            </tr>)}
          </tbody>
        </table>
        <Modal show={modalShow !== false} onHide={() => setModalShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Удаление пользователя</Modal.Title>
          </Modal.Header>
          <Modal.Body>Вы действительно хотите удалить этого пользователя?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => deleteUser()}>
              Удалить
            </Button>
            <Button variant="secondary" onClick={() => setModalShow(false)}>
              Отмена
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    }
  </>);
}