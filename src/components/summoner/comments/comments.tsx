import {useState} from 'react'
import {CreateComment} from './createComment'
import {ViewComments} from './viewComments'
import {useQuery} from '@tanstack/react-query'
import api from '@/external/api/api'

export function Comments({match}: {match: any}) {
  const [view, setView] = useState<'view' | 'create'>('view')
  const [reply_comment, setReplyComment] = useState({})

  const query = useQuery(
    ['connected-accounts'],
    () => api.player.getConnectedAccounts().then(response => response.data.data),
    {refetchOnMount: false, retry: false}
  )

  return (
    <div>
      {view === 'view' && (
        <>
          <button
            onClick={() => {
              setReplyComment({})
              setView('create')
            }}
            className={`dark btn-small`}
          >
            New Comment
          </button>
          <ViewComments
            summoners={query.data || []}
            theme="dark"
            match={match}
            setView={setView}
            setReplyComment={setReplyComment}
          />
        </>
      )}
      {view === 'create' && (
        <CreateComment
          summoners={query.data || []}
          theme="dark"
          match={match}
          setView={setView}
          reply_to={reply_comment}
        />
      )}
    </div>
  )
}
