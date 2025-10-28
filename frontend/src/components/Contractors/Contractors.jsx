import { useEffect, useState, useContext } from "react";
import { Modal, ListGroup, Button, Container, Row, Col, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function Contractors() {
  const navigator = useNavigate();
  const [contractors, setContractors] = useState(null);
  const params = useParams();
  const [modalShow, setModalShow] = useState(false);
  const dataContext = useContext(DataContext);

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
        let data = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${params.taskId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        let response = await data.json();
        setContractors(response.data.users);
      } catch (e) {

      }
    }

    getData();
  }, [])

  const deleteContractor = async (e) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/tasks/${params.taskId}/${modalShow}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setContractors(contractors.filter(item => item.id !== modalShow))
      setModalShow(false);
    } catch (e) {
      console.log(e)
    }
  }

  const deleteContractorModal = (id) => {
    setModalShow(id);
  }

  return (<>
    {contractors !== null &&
      <Container>
        <h2 className="mb-4">Исполнители</h2>
        <Button
          variant="primary"
          size="sl"
          title="Добавить исполнителя"
          style={{marginBottom: 10}}
          onClick={(e) => navigator(`/contractors/${params.taskId}/add_contractor`, {state: {prev: `/contractors/${params.taskId}`}})}
        >Добавить исполнителя</Button>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">ФИО</th>
              <th scope="col">E-mail</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {contractors.map(item => <tr>
              <td>{item.fullname}</td>
              <td>{item.email}</td>
              <td className="d-flex justify-content-end" style={{gap: 10}}>
                <Button
                  style={{width: '38px'}}
                  variant="outline-danger"
                  size="sm"
                  title="Удалить"
                  onClick={(e) => deleteContractorModal(item.id)}
                >
                  &#10005;
                </Button>
              </td>
            </tr>)}
          </tbody>
        </table>
        <Modal show={modalShow !== false} onHide={() => setModalShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Удаление исполнителя</Modal.Title>
          </Modal.Header>
          <Modal.Body>Вы действительно хотите удалить этого исполнителя?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => deleteContractor()}>
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