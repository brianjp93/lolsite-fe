import { useEffect, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { QUEUEFILTER } from "@/utils/constants";

export interface MatchFilterFormType {
  queue: number | string;
  champion: string;
  startDate: string;
  endDate: string;
  summoners: string;
}
export function MatchFilterForm({
  onUpdate,
}: {
  onUpdate: (data?: MatchFilterFormType) => void;
}) {
  const form = useForm<MatchFilterFormType>();
  const { handleSubmit } = form;
  const watchQueue = form.watch("queue");

  const onSubmit: SubmitHandler<MatchFilterFormType> = useCallback(
    (data) => {
      onUpdate(data);
    },
    [onUpdate]
  );

  useEffect(() => {
    handleSubmit(onSubmit)();
  }, [watchQueue, handleSubmit, onSubmit]);

  return (
    <>
      <form>
        <div
          style={{
            width: 600,
          }}
          className="input-field dark"
        >
          <select {...form.register("queue")}>
            <option value="">any</option>
            {QUEUEFILTER.map((item) => {
              return (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              );
            })}
          </select>
          <label>Queue</label>
        </div>
      </form>
    </>
  );
}
