import {Link, useNavigate, useParams} from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import {useMutation, useQuery} from "@tanstack/react-query";
import {fetchEvent, queryClient, updateEvent} from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const {id} = useParams();

  const {data, isPending,isError, error} = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal}) => fetchEvent({signal, id})
  })

  const {mutate} = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      await queryClient.cancelQueries({queryKey: ['events', id]});
      const previousData = queryClient.getQueryData(['events', id])
      queryClient.setQueryData(['events', id], data.event)
      return {previousData}
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(['events', id], context.previousData)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events', id]);
    }
  })

  function handleSubmit(formData) {
    mutate({id, event: formData});
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;
  if (isPending) {
    content = <div className={'center'}><LoadingIndicator /></div>
  }
  if (isError) {
    content = <>
      <ErrorBlock title={'Failed to load data'} message={error.info?.message || 'Try again later.'} />
      <div className={'form-actions'}>
        <Link to={'../'} className={'button'}>Okay</Link>
      </div>
    </>
  }
  if (data) {
    content = <EventForm inputData={data} onSubmit={handleSubmit}>
      <Link to="../" className="button-text">
        Cancel
      </Link>
      <button type="submit" className="button">
        Update
      </button>
    </EventForm>
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
