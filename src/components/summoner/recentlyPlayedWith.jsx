import { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import {puuidRoute} from '@/routes'
import Link from 'next/link'


export class RecentlyPlayedWith extends Component {
  constructor(props) {
    super(props)
    this.state = {}

    this.countPlayers = this.countPlayers.bind(this)
    this.sortPlayers = this.sortPlayers.bind(this)
  }
  countPlayers() {
    var count = {}
    for (const match of this.props.matches) {
      for (var p of match.participants) {
        const tagline = p.riot_id_tagline
        const id_name = p.riot_id_name
        let name = p.summoner_name
        if (tagline && id_name) {
          name = `${id_name}#${tagline}`
        }
        if (p.puuid === this.props.summoner.puuid) {
          // ignore self
        } else if ([0, '0'].indexOf(p.puuid) >= 0) {
          // ignore bots
        } else {
          if (count[name] === undefined) {
            count[name] = {count: 1, puuid: p.puuid}
          } else {
            count[name].count += 1
          }
        }
      }
    }
    return count
  }
  sortPlayers() {
    var count_dict = this.countPlayers()
    var count_list = []
    for (var name in count_dict) {
      // only add to list if count > 1
      if (count_dict[name].count > 1) {
        count_list.push({
          summoner_name: name,
          count: count_dict[name].count,
          puuid: count_dict[name].puuid
        })
      }
    }
    count_list.sort((a, b) => {
      return b.count - a.count
    })
    return count_list
  }
  render() {
    return (
      <div className='card-panel h-[200px] w-[270px] p-2'>
        <div className='underline inline'>
          Players In These Games
        </div>{' '}
        <small>{this.props.matches.length} games</small>
        <br />
        <div className="quiet-scroll overflow-y-scroll">
          <div className='flex flex-wrap w-full'>
            {this.sortPlayers().map((data) => {
              return (
                <Fragment key={`${data.puuid}`}>
                  <div className='text-sm p-1 w-3/4'>
                    <Link
                      href={puuidRoute(data.puuid)}
                      className="cursor-pointer hover:underline"
                    >
                      {data.summoner_name}
                    </Link>
                  </div>
                  <div className='text-sm p-1 w-1/4'>{data.count}</div>
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}
RecentlyPlayedWith.propTypes = {
  summoner: PropTypes.object,
  matches: PropTypes.array,
  region: PropTypes.string,
}
