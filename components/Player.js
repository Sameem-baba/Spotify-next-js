import {  ReplyIcon, SwitchHorizontalIcon, VolumeUpIcon } from "@heroicons/react/outline";
import { FastForwardIcon, PlayIcon, PauseIcon, RewindIcon, VolumeUpIcon as VolumeDownIcon } from '@heroicons/react/solid'
import { debounce, shuffle } from "lodash";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import useSongInfo from "../hooks/useSongInfo";
import useSpotify from "../hooks/useSpotify";

const colors = [
    "to-indigo-500",
    "to-blue-500",
    "to-green-500",
    "to-red-500",
    "to-yellow-500",
    "to-pink-500",
    "to-purple-500",
]

function Player() {
    const spotifyApi = useSpotify();
    const { data: session } = useSession();
    const [color, setColor] = useState(null);
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const [volume, setVolume] = useState(50);
    const songInfo = useSongInfo();

    useEffect(() => {
        setColor(shuffle(colors).pop());
    }, [currentTrackId]);

    const fetchCurrentSong = () => {
        if (!songInfo) (
            spotifyApi.getMyCurrentPlayingTrack().then((data) => {
                console.log("Now playing", data.body?.item);
                setCurrentTrackId(data.body?.item?.id);

                spotifyApi.getMyCurrentPlaybackState().then((data) => {
                    setIsPlaying(data.body?.is_playing);
                })
            })
        )
    }

    const handlePlayPause = () => {
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
            if (data.body.is_playing) {
                spotifyApi.pause();
                setIsPlaying(false)
            } else {
                spotifyApi.play();
                setIsPlaying(true);
            }
        });
    }

    useEffect(() => {
        if (spotifyApi.getAccessToken() && !currentTrackId) {
            fetchCurrentSong();
            setVolume(50);
        }
    }, [session, currentTrackId, spotifyApi]);

    useEffect(() => {
        if (volume > 0 && volume < 100) {
            deboucedAdjustVolume(volume);
        }
    }, [volume]);

    const deboucedAdjustVolume = useCallback(
        debounce((volume) => {
            spotifyApi.setVolume(volume)
        }, 200),
        []
    )

    return (
        <div className={`h-24 bg-gradient-to-b from-gray-900 ${color} text-xs md:text-base text-white grid grid-cols-3 px-2 md:px-8`}>
            <div className="flex items-center space-x-4">
                <img
                    className="hidden md:inline h-10 w-10"
                    src={songInfo?.album.images?.[0]?.url}
                    alt=""
                />
            

                <div>
                    <h3>{songInfo?.name}</h3>
                    <p>{songInfo?.artists?.[0]?.name}</p>
                </div>
            </div>

            <div className='flex items-center justify-evenly'>
                <SwitchHorizontalIcon className="button" />
                <RewindIcon onClick={() => spotifyApi.skipToPrevious()}  className='button' />
                {isPlaying ? (
                    <PauseIcon onClick={handlePlayPause} className='button w-10 h-10' />
                ) : (
                    <PlayIcon onClick={handlePlayPause} className='button w-10 h-10' />
                )
                }

                <FastForwardIcon onClick={() => spotifyApi.skipToNext()} className='button' />
                <ReplyIcon className='button' />
            </div>

            <div className='flex items-center space-x-3 md:space-x-4 justify-end pr-5'>
                <VolumeUpIcon
                    onClick={() => volume > 0 && setVolume(volume - 10)}
                    className='button'
                />
                <input
                    className='w-14 md:w-28'
                    type="range"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    min={0}
                    max={100}
                />
                <VolumeDownIcon
                    onClick={() => volume < 100 && setVolume(volume + 10)}
                    className='button'
                />
            </div>
        </div>
    )
}

export default Player;