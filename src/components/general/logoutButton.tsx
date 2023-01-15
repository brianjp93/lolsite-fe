import api from '@/external/api/api'
import {useMutation} from '@tanstack/react-query'

export default function LogoutButton() {
  const logout = useMutation(
    () => api.player.logout(),
  )

  return (
    <>
      <button
        onClick={() => {}}
        className="btn btn-default">
        logout
      </button>
    </>
  )
}
