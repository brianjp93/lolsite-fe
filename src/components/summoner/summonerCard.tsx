import {useState, useEffect} from 'react'
import {useQuery, useMutation} from '@tanstack/react-query'
import type {SummonerType} from '@/external/types'
import {useUser} from '@/hooks'
import clsx from 'clsx'
import { SpectateModal } from './spectate'
import ReactTooltip from 'react-tooltip'
import numeral from 'numeral'
import api from '@/external/api/api'
import {Popover} from 'react-tiny-popover'

export function SummonerCard({
  refreshPage,
  lastRefresh,
  summoner,
  icon,
  isSpectateModalOpen,
  setIsSpectateModalOpen,
  spectateData,
  positions,
  region,
}: {
  refreshPage: () => void
  lastRefresh?: number
  summoner: SummonerType
  icon: any
  isSpectateModalOpen: boolean
  setIsSpectateModalOpen: (x: boolean) => void
  spectateData: any
  positions: any
  region: string
}) {
  const [timeDesc, setTimeDesc] = useState('')
  const [isNameHistoryOpen, setIsNameHistoryOpen] = useState(false)
  const user = useUser()
  const generalRankImage = (tier: string) => {
    const tier_convert = {
      iron: 'Iron',
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
      diamond: 'Diamond',
      master: 'Master',
      grandmaster: 'Grandmaster',
      challenger: 'Challenger',
    }
    const new_tier = tier.toLowerCase() as keyof typeof tier_convert
    if (tier_convert[new_tier]) {
      tier = tier_convert[new_tier]
    }
    return `${store.state.static}ranked-emblems/emblems/Emblem_${tier}.png`
  }
  useQuery(
    ['refreshTimeQuery'],
    () => {
      const now = Date.now()
      if (lastRefresh) {
        const diff = Math.round((now - lastRefresh) / 1000)
        const minutes = Math.floor(diff / 60)
        let desc = ''
        if (minutes > 0) {
          if (minutes === 1) {
            desc = `a minute ago`
          } else if (minutes > 99) {
            desc = 'a long time ago'
          } else {
            desc = `${minutes} minutes ago`
          }
        } else {
          desc = 'a moment ago'
        }
        setTimeDesc(desc)
      }
    },
    {retry: false, refetchInterval: 1000 * 10},
  )

  const reputation = useQuery([summoner?.id], () => api.player.getReputation(summoner.id), {
    retry: false,
    enabled: !!summoner?.id && !!user,
    refetchOnWindowFocus: false,
  })

  const repMutation = useMutation(
    async (is_approve: boolean) => {
      if (reputation.data) {
        return api.player.updateReputation(reputation.data.id, summoner.id, is_approve)
      } else {
        return api.player.createReputation(summoner.id, is_approve)
      }
    },
    {
      onSuccess: () => {
        reputation.refetch()
      },
    },
  )

  const queueName = (queue: string) => {
    const convert: Record<string, string> = {
      RANKED_SOLO_5x5: 'Solo/Duo',
      RANKED_FLEX_SR: '5v5 Flex',
      RANKED_FLEX_TT: '3v3 Flex',
      RANKED_TFT: 'TFT',
    }
    return convert[queue] || queue
  }

  const getWinRate = (wins: number, losses: number) => {
    return (wins / (wins + losses)) * 100
  }

  const isFavorite = store.state.favorites.filter((x: any) => x.summoner === summoner.id).length > 0

  useEffect(() => {
    ReactTooltip.rebuild()
  }, [isFavorite])

  const toggleFavorite = useMutation(
    async () => {
      return api.player
        .Favorite({summoner_id: summoner.id, verb: isFavorite ? 'remove' : 'set'})
        .then((x) => x.data.data)
    },
    {
      onSuccess: (data) => {
        store.setState({favorites: data})
      },
    },
  )

  const toggleDefault = useMutation(
    async () => {
      let data: {summoner_id: null | number} = {summoner_id: null}
      let keys = Object.keys(store.state.user.default_summoner)
      if (keys.length === 0) {
        data = {summoner_id: summoner.id}
      }
      return api.player.editDefaultSummoner(data).then((response) => {
        return response.data.default_summoner
      })
    },
    {
      onSuccess: (data) => {
        const user = {...store.state.user, default_summoner: data}
        store.setState({user: user})
      },
    },
  )

  const miniSeries = (progress: any) => {
    const letters: string[] = []
    for (const l of progress) {
      letters.push(l)
    }
    return letters.map((letter, key) => {
      const shared_styles = {
        margin: '0 2px',
        display: 'inline-block',
        height: 14,
        width: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'grey',
      }
      if (letter === 'W') {
        return (
          <div
            key={key}
            className="bg-victory"
            style={{
              ...shared_styles,
            }}
          ></div>
        )
      } else if (letter === 'L') {
        return (
          <div
            key={key}
            className="bg-loss"
            style={{
              ...shared_styles,
            }}
          ></div>
        )
      } else {
        return (
          <div
            key={key}
            style={{
              ...shared_styles,
              background: 'grey',
            }}
          ></div>
        )
      }
    })
  }
  return (
    <>
      <span>
        <div style={{position: 'relative', padding: 18}} className={`card-panel dark`}>
          {icon !== undefined && (
            <span
              style={{
                position: 'relative',
                display: 'inline-block',
              }}
            >
              <img
                style={{
                  height: 50,
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  borderRadius: 5,
                }}
                src={icon}
                alt={`profile icon ${icon}`}
              />
              <span
                style={{
                  display: 'inline-block',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  fontSize: 'smaller',
                  width: 50,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 'inherit',
                    height: 'inherit',
                    textAlign: 'center',
                    marginTop: 43,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 'bold',
                      display: 'inline-block',
                      width: 40,
                      borderRadius: 4,
                      color: 'black',
                      background: 'white',
                      padding: '0 2px',
                    }}
                  >
                    {summoner.summoner_level}
                  </span>
                </span>
              </span>
            </span>
          )}

          <div
            style={{
              display: 'inline-block',
              width: 300,
              maxWidth: '87%',
              textAlign: 'center',
              verticalAlign: 'middle',
              height: 25,
            }}
          >
            <Popover
              onClickOutside={() => setIsNameHistoryOpen(false)}
              isOpen={isNameHistoryOpen}
              positions={['bottom']}
              containerStyle={{zIndex: '11'}}
              content={<NameChanges summonerId={summoner.id} />}
            >
              <span
                onClick={() => setIsNameHistoryOpen(true)}
                style={{
                  textDecoration: 'underline',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {summoner.name}
              </span>
            </Popover>
            <br />
            {region && (
              <SpectateModal
                queueConvert={store.state.queue_convert}
                summoner_id={summoner._id}
                isSpectateModalOpen={isSpectateModalOpen}
                setIsSpectateModalOpen={setIsSpectateModalOpen}
                region={region}
              >
                <small>{spectateData ? 'Live Game!' : 'Check For Game'}</small>
              </SpectateModal>
            )}
          </div>

          <span style={{position: 'absolute', right: 2, top: 2}}>
            <small
              className="unselectable"
              style={{
                display: 'inline-block',
                verticalAlign: 'top',
                marginRight: 3,
                borderStyle: 'solid',
                borderWidth: 1,
                padding: 2,
                borderRadius: 3,
                borderColor: '#ffffff40',
                color: '#ffffff70',
                marginTop: 3,
              }}
            >
              {lastRefresh !== null && <span>Last Refresh: </span>}
              <span style={{fontWeight: 'bold'}}>{timeDesc}</span>
            </small>
            <button onClick={() => refreshPage()} className="dark btn-small">
              <i className="material-icons">autorenew</i>
            </button>
          </span>

          {store.state.user.email !== undefined && (
            <>
              <span
                style={{
                  position: 'absolute',
                  right: 2,
                  top: 38,
                }}
              >
                <button
                  data-tip={isFavorite ? 'Remove favorite' : 'Set favorite'}
                  className="dark btn-small"
                  onClick={() => toggleFavorite.mutate()}
                >
                  <i className="material-icons">{isFavorite ? 'favorite' : 'favorite_border'}</i>
                </button>
              </span>
            </>
          )}

          {summoner.has_match_overlap && (
            <div className="row" style={{marginTop: 20, marginBottom: 0}}>
              <div className="col s12">
                <button
                  style={{marginRight: 5}}
                  onClick={() => repMutation.mutate(false)}
                  className={clsx('btn btn-link dark', {
                    disabled: reputation.data?.is_approve === false,
                  })}
                >
                  <i className="material-icons">thumb_down</i>
                </button>
                <button
                  onClick={() => repMutation.mutate(true)}
                  className={clsx('btn btn-link dark', {
                    disabled: reputation.data?.is_approve === true,
                  })}
                >
                  <i className="material-icons">thumb_up</i>
                </button>
              </div>
            </div>
          )}

          <div style={{paddingTop: 10}}>
            {positions.map((pos: any) => {
              if (pos.queue_type === 'RANKED_SOLO_5x5') {
                const gen_positions = ['NONE', 'APEX']
                return (
                  <div key={`${pos.position}-${summoner._id}`}>
                    <div>
                      <div
                        style={{
                          display: 'inline-block',
                          width: 50,
                        }}
                      >
                        {gen_positions.indexOf(pos.position) >= 0 && (
                          <img src={generalRankImage(pos.tier)} style={{height: 40}} alt="" />
                        )}
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          lineHeight: 1,
                          verticalAlign: 'super',
                        }}
                      >
                        <span>
                          {pos.tier} {pos.rank}
                        </span>
                        <br />
                        <small>
                          <span
                            style={{
                              fontWeight: 'bold',
                            }}
                          >{`${numeral(getWinRate(pos.wins, pos.losses)).format(
                            '0.0',
                          )}%`}</span>{' '}
                          - {pos.wins}W / {pos.losses}L
                        </small>
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          position: 'absolute',
                          right: 18,
                        }}
                      >
                        <small className={`dark pill`}>{queueName(pos.queue_type)}</small>{' '}
                        <span className={`dark pill`}>{pos.league_points} LP</span>
                        {pos.series_progress && (
                          <div
                            style={{
                              textAlign: 'right',
                            }}
                          >
                            {miniSeries(pos.series_progress)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })}
            {positions.map((pos: any) => {
              if (pos.queue_type !== 'RANKED_SOLO_5x5') {
                return (
                  <div key={`${pos.position}-${pos.queue_type}-${summoner._id}`}>
                    <hr />
                    <div>
                      <div
                        style={{
                          display: 'inline-block',
                          width: 50,
                        }}
                      >
                        <img src={generalRankImage(pos.tier)} style={{height: 40}} alt="" />
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          lineHeight: 1,
                          verticalAlign: 'super',
                        }}
                      >
                        <span>
                          {pos.tier} {pos.rank}
                        </span>
                        <br />
                        <small>
                          <span
                            style={{
                              fontWeight: 'bold',
                            }}
                          >{`${numeral(getWinRate(pos.wins, pos.losses)).format(
                            '0.0',
                          )}%`}</span>{' '}
                          - {pos.wins}W / {pos.losses}L
                        </small>
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          position: 'absolute',
                          right: 18,
                        }}
                      >
                        <small className={`dark pill`}>{queueName(pos.queue_type)}</small>{' '}
                        <span className={`dark pill`}>{pos.league_points} LP</span>
                        {pos.series_progress && (
                          <div
                            style={{
                              textAlign: 'right',
                            }}
                          >
                            {miniSeries(pos.series_progress)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>

          {store.state.user.email !== undefined && (
            <div>
              <button
                onClick={() => toggleDefault.mutate()}
                style={{width: '100%'}}
                className={`dark btn-small`}
              >
                {store.state.user.default_summoner.id === summoner.id && (
                  <>Remove as Default Profile</>
                )}
                {store.state.user.default_summoner.id !== summoner.id && (
                  <>Set as Default Profile</>
                )}
              </button>
            </div>
          )}
        </div>
      </span>
    </>
  )
}

function NameChanges({summonerId}: {summonerId: number}) {
  const nameChangeQuery = useQuery(
    ['name-change', summonerId],
    () => api.player.getNameChanges(summonerId),
    {staleTime: 1000 * 60 * 10, refetchOnMount: true, refetchOnWindowFocus: false},
  )
  return (
    <>
      <h3 style={{marginTop: -10}}>Old Names</h3>
      <hr />
      {nameChangeQuery.isLoading && <div>Loading...</div>}
      {nameChangeQuery.isSuccess && (
        <>
        {nameChangeQuery.data.map((item) => {
            return <div key={item.old_name} title={item.created_date}>{item.old_name}</div>
          })}
          {nameChangeQuery.data.length === 0 && <div>No historical names found.</div>}
        </>
      )}
    </>
  )
}
