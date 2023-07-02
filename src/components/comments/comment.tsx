import "easymde/dist/easymde.min.css";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useConnectedSummoners } from "@/hooks";
import Orbit from "../general/spinner";
import { useMutation } from "@tanstack/react-query";
import api from "@/external/api/api";
import Link from "next/link";
import { myAccount } from "@/routes";
import clsx from "clsx";

// need to make sure this import happens client side
const SimpleMdeReact = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export function Editor({
  value,
  setValue,
}: {
  value: string;
  setValue: (x: string) => void;
}) {
  return (
    <>
      <SimpleMdeReact value={value} onChange={(value) => setValue(value)} />
    </>
  );
}

export function CreateComment({
  onCancel,
  match_id,
  reply_to,
}: {
  onCancel: () => void;
  match_id: number;
  reply_to?: number;
}) {
  const [value, setValue] = useState("");
  const [selectedSummoner, setSelectedSummoner] = useState<string>();
  const connectedQ = useConnectedSummoners();
  const connected = connectedQ.data || [];

  const create = useMutation((puuid: string) =>
    api.player.createComment({
      markdown: value,
      match: match_id,
      reply_to,
      summoner: puuid,
    })
  );

  return (
    <>
      <Editor {...{ value, setValue }} />
      {connectedQ.isLoading && (
        <>
          <Orbit />
          <div>Loading connected summoners.</div>
        </>
      )}
      {!connectedQ.isLoading && connected.length === 0 && (
        <div>
          No Summoners connected. Please connect an account at
          <Link href={myAccount()} className="ml-1" />
        </div>
      )}
      {!connectedQ.isLoading && connected.length > 0 && (
        <select
          value={selectedSummoner}
          onChange={(event) => setSelectedSummoner(event.currentTarget.value)}
        >
          {connected.map((x) => {
            return (
              <option key={x.puuid} value={x.puuid}>
                {x.name}
              </option>
            );
          })}
        </select>
      )}
      <div className="flex">
        <button onClick={() => onCancel()} className="btn btn-default">
          Cancel
        </button>
        <button
          onClick={() => {
            if (selectedSummoner && value) {
              create.mutate(selectedSummoner || "");
            }
          }}
          className={clsx("btn btn-primary", {
            disabled: !selectedSummoner || !value || create.isLoading,
          })}
        >
          Create Comment
        </button>
      </div>
    </>
  );
}

export function ViewComments() {
  return <></>;
}
