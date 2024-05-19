import Skeleton from "@/components/general/skeleton";
import { useAllItems } from "@/hooks";
import { useState } from "react";
import { LineChart, CartesianGrid, } from "recharts";

export default function ItemStatPage() {
  const itemsQ = useAllItems({});
  const items = itemsQ.data?.data;


  return <Skeleton>
    <div>
      Hello world
    </div>
  </Skeleton>
}

export function ArmorReductionGraph() {
  const [armor, setArmor] = useState(100);

}
