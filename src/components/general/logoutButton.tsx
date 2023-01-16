import api from "@/external/api/api";
import {useUser} from "@/hooks";
import { useMutation } from "@tanstack/react-query";

export default function LogoutButton() {
  const userQuery = useUser()
  const logout = useMutation(() => api.player.logout(), {
    onSuccess: () => userQuery.refetch(),
  });

  return (
    <>
      <button onClick={() => logout.mutate()} className="btn btn-default">
        logout
      </button>
    </>
  );
}
