import "easymde/dist/easymde.min.css";
import {useState} from "react";
import dynamic from "next/dynamic";

const SimpleMdeReact = dynamic(() => import('react-simplemde-editor'), { ssr: false })


export function Editor() {
  const [value, setValue] = useState("")
  return (
    <>
      <SimpleMdeReact value={value} onChange={(value) => setValue(value)} />
    </>
  )
}
