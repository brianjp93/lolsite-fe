import {useSimpleItem} from '@/hooks'
import {useState} from 'react'
import {Popover} from 'react-tiny-popover'

export function Item(props: any) {
  return (
    <div>
      {props.item === null && <span>Retrieving item...</span>}
      {props.item !== null && (
        <div>
          <div>
            <span style={{textDecoration: 'underline'}}>{props.item.name}</span>{' '}
            <span style={{color: 'gold'}}>{props.item.gold.total}</span>
          </div>
          <div>
            <small dangerouslySetInnerHTML={{__html: props.item.description}}></small>
          </div>
        </div>
      )}
    </div>
  )
}

export function ItemPopover({major, minor, item_id, style, children}: React.PropsWithChildren<any>) {
  const [isOpen, setIsOpen] = useState(false)
  const query = useSimpleItem({id: item_id, major, minor})
  const item = query.data

  const toggle = () => setIsOpen(x => !x)

  if (item_id) {
    return (
      <Popover
        onClickOutside={() => setIsOpen(false)}
        isOpen={isOpen}
        positions={['top']}
        containerStyle={{zIndex: '11'}}
        content={<Item item={item} />}
      >
        <div style={{...style, cursor: 'pointer'}} onClick={toggle}>
          {children}
        </div>
      </Popover>
    )
  } else {
    return <div style={style}>{children}</div>
  }
}
