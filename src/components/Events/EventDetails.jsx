import {Link, Outlet, useNavigate, useParams} from 'react-router-dom';

import Header from '../Header.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import {deleteEvent, fetchEvent, queryClient} from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import {useState} from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false)

  const {id} = useParams()
  const navigate = useNavigate();
  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal}) => fetchEvent({id, signal})
  });

  const {mutate, isPending: isPendingDeletion, isError: isErrorDeletion, error: errorDeletion} = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['events'], refetchType: "none"})  ;
      navigate('/events');
    }
  });

  const handleDelete = () => {
    mutate({id});
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      {isDeleting && (
        <Modal onClose={() => setIsDeleting(false)}>
          <h2>Delete?</h2>
          <p>Are you sure you want to delete meetup "{data.title}"?</p>
          <div className={'form-actions'}>
            {isPendingDeletion && <p>Deleting...</p>}
            {!isPendingDeletion && (
              <>
                <button className={'button-text'} onClick={() => setIsDeleting(false)}>Nope</button>
                <button className={'button'} onClick={handleDelete}>Yes, delete</button>
              </>
            )}
          </div>
          {isErrorDeletion && <ErrorBlock title={'Failed to delete event'} message={errorDeletion.info?.message || 'Please try again'} />}
        </Modal>
      )}
      {isPending && <div className={'center'}><LoadingIndicator /></div>}
      {isError && <ErrorBlock title={'Failed to fetch event data'} message={error.info?.message || 'Please try again'} />}
      {data && (<article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={() => setIsDeleting(true)}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{data.date} {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>)}
    </>
  );
}
