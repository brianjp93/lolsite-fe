import { ResponsiveContainer, LineChart, Tooltip, XAxis, CartesianGrid, YAxis } from "recharts";
import numeral from "numeral";
import { useRankHistory } from "@/hooks";
import { useState } from "react";
import { subDays, startOfDay } from "date-fns";

export default function RankHistory({ summonerId }: { summonerId: number }) {
  const [queue, setQueue] = useState("RANKED_SOLO_5x5");
  const [groupBy, setGroupBy] = useState("week");

  const end = new Date();
  const start = startOfDay(subDays(end, 365));

  const rankQ = useRankHistory({
    id: summonerId,
    queue,
    group_by: "day",
    start: start.toISOString(),
    end: end.toISOString(),
  });

  return (
    <>
      <div>Ranked History</div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          margin={{
            left: -10,
            right: 20,
          }}
          data={rankQ.data || []}
        >
          <CartesianGrid vertical={false} stroke="#777" strokeDasharray="4 4" />

          <XAxis
            hide={false}
            tickFormatter={(tickItem) => {
              const m = Math.round(tickItem / 1000 / 60);
              return `${m}m`;
            }}
            dataKey="timestamp"
          />

          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={(tick) => {
              return numeral(tick).format("0a");
            }}
          />

          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
