import api from "@/external/api/api";
import {userKey} from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

export default function LogoutButton() {
  const queryClient = useQueryClient()
  const logout = useMutation(() => api.player.logout(), {
    onSuccess: () => queryClient.invalidateQueries(userKey),
  });

  return (
    <>
      <button onClick={() => logout.mutate()} className="btn btn-default">
        logout
      </button>
    </>
  );
}
