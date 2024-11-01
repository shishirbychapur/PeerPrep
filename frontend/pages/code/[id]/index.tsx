import { EndIcon, PlayIcon, SubmitIcon } from '@/assets/icons'
import { ITestcase, LanguageMode, getCodeMirrorLanguage } from '@/types'
import { mockChatData, mockTestCaseData, mockUserData } from '@/mock-data'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import CustomLabel from '@/components/ui/label'
import CustomTabs from '@/components/customs/custom-tabs'
import { DifficultyLabel } from '@/components/customs/difficulty-label'
import Image from 'next/image'
import LanguageModeSelect from '../language-mode-select'
import React from 'react'
import TestcasesTab from '../testcase-tab'
import useProtectedRoute from '@/hooks/UseProtectedRoute'
import { useRouter } from 'next/router'
import CodeMirrorEditor from '../editor'
import { Category, IMatch, SortedComplexity } from '@repo/user-types'
import { useSession } from 'next-auth/react'
import { getMatchDetails } from '@/services/matching-service-api'
import { convertSortedComplexityToComplexity } from '@repo/question-types'
import io, { Socket } from 'socket.io-client'
import UserAvatar from '@/components/customs/custom-avatar'
import { toast } from 'sonner'

interface ICollaborator {
    name: string
    email: string
}

const userData: ICollaborator = mockUserData
const initialChatData = mockChatData
const testCasesData: ITestcase[] = mockTestCaseData

const formatQuestionCategories = (cat: Category[]) => {
    return cat.join(', ')
}

const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
}

const getChatBubbleFormat = (currUser: ICollaborator, type: 'label' | 'text') => {
    let format = ''
    if (currUser.email === userData.email) {
        format = 'items-end ml-5'
        // Add more format based on the type
        if (type === 'text') {
            format += ' bg-theme-600 rounded-xl text-white'
        }
    } else {
        format = 'items-start text-left mr-5'
        // Add more format based on the type
        if (type === 'text') {
            format += ' bg-slate-100 rounded-xl p-2 text-slate-900'
        }
    }

    return format
}

export default function Code() {
    const router = useRouter()
    const [isChatOpen, setIsChatOpen] = useState(true)
    const [chatData, setChatData] = useState(initialChatData)
    const { id } = router.query
    const [editorLanguage, setEditorLanguage] = useState<LanguageMode>(LanguageMode.Javascript)
    const testTabs = ['Testcases', 'Test Results']
    const [activeTestTab, setActiveTestTab] = useState(0)
    const [matchData, setMatchData] = useState<IMatch | undefined>(undefined)
    const socketRef = useRef<Socket | null>(null)
    const [isOtherUserOnline, setIsOtherUserOnline] = useState(true)

    const retrieveMatchDetails = async () => {
        const matchId = router.query.id as string
        if (!matchId) {
            return
        }
        const response = await getMatchDetails(matchId).catch((_) => {
            router.push('/')
        })
        setMatchData(response)
    }

    const { data: sessionData } = useSession()

    useEffect(() => {
        retrieveMatchDetails()
    }, [])

    useEffect(() => {
        socketRef.current = io('ws://localhost:3009', {
            auth: {
                token: sessionData?.user.accessToken,
                name: sessionData?.user.username,
                roomId: id as string,
            },
        })

        socketRef.current.on('connect', () => {
            if (socketRef.current) {
                socketRef.current.emit('joinRoom', { roomId: id })
                console.log('Connected and joined room:', id)
            }
        })

        socketRef.current.on('update-language', (language: string) => {
            setEditorLanguage(language as LanguageMode)
            toast.success('Language mode updated')
        })

        socketRef.current.on('user-connected', (username: string) => {
            if (username !== sessionData?.user.username) {
                setIsOtherUserOnline(true)
            }
        })

        socketRef.current.on('user-disconnected', (username: string) => {
            if (username !== sessionData?.user.username) {
                setIsOtherUserOnline(false)
            }
        })

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
            }
        }
    }, [])

    // Ref for autoscroll the last chat message
    const chatEndRef = useRef<HTMLDivElement | null>(null)

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen)
    }

    // TODO: create message service to handle messages
    const sendMessage = (message: string) => {
        const newMessage = {
            user: userData,
            message,
            timestamp: new Date().toISOString(),
        }
        setChatData([...chatData, newMessage])
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
            sendMessage(e.currentTarget.value)
            e.currentTarget.value = ''
        }
    }

    // Scroll to the bottom of the chat box when new messages are added
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [chatData])

    const handleLanguageModeSelect = (value: string) => {
        socketRef.current?.emit('change-language', value)
    }

    const handleRunTests = () => {
        // const currCode = editorRef.current?.editor?.getValue()
        // console.log(currCode)
    }

    const handleActiveTestTabChange = (tab: number) => {
        setActiveTestTab(tab)
        console.log(activeTestTab)
    }

    const handleEndSession = () => {
        if (socketRef.current) {
            socketRef.current.disconnect()
        }
        router.push('/')
    }

    const { loading } = useProtectedRoute()

    if (loading) return null

    return (
        <div className="flex gap-3">
            <section className="w-1/3 flex flex-col">
                <div className="flex items-center gap-4">
                    <Image src="/logo.svg" alt="Logo" width={28} height={28} className="my-2" />
                    <h2 className="text-lg font-medium">
                        Session with:{' '}
                        {sessionData?.user.username !== matchData?.user1Name
                            ? matchData?.user1Name
                            : matchData?.user2Name}
                    </h2>
                </div>
                <div
                    id="question-data"
                    className="flex-grow border-2 rounded-lg border-slate-100 mt-2 py-2 px-3 overflow-y-auto"
                >
                    <h3 className="text-lg font-medium">{matchData?.question.title}</h3>
                    <div className="flex gap-3 my-2 text-sm">
                        <DifficultyLabel
                            complexity={convertSortedComplexityToComplexity(
                                matchData?.question.complexity ?? SortedComplexity.EASY
                            )}
                        />
                        <CustomLabel
                            title={formatQuestionCategories(matchData?.question.categories ?? [])}
                            textColor="text-theme"
                            bgColor="bg-theme-100"
                        />
                    </div>
                    <div className="mt-6">{matchData?.question.description}</div>
                </div>

                <div className="border-2 rounded-lg border-slate-100 mt-4 max-h-twoFifthScreen flex flex-col">
                    <div className="flex items-center justify-between border-b-[1px] pl-3 ">
                        <h3 className="text-lg font-medium">Chat</h3>
                        <Button variant="iconNoBorder" size="icon" onClick={toggleChat}>
                            <Image
                                src={`/icons/${isChatOpen ? 'minimise' : 'maximise'}.svg`}
                                alt="Minimise chat"
                                width={20}
                                height={20}
                            />
                        </Button>
                    </div>
                    {isChatOpen && (
                        <>
                            <div className="overflow-y-auto p-3 pb-0">
                                {chatData.map((chat, index) => (
                                    <div
                                        key={index}
                                        className={`flex flex-col gap-1 mb-5 ${getChatBubbleFormat(chat.user, 'label')}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-medium">{chat.user.name}</h4>
                                            <span className="text-xs text-slate-400">
                                                {formatTimestamp(chat.timestamp)}
                                            </span>
                                        </div>
                                        <div
                                            className={`text-sm py-2 px-3 text-balance break-words w-full ${getChatBubbleFormat(chat.user, 'text')}`}
                                        >
                                            {chat.message}
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef}></div>
                            </div>
                            <div className="m-3 px-3 py-1 border-[1px] rounded-xl text-sm">
                                <input
                                    type="text"
                                    className="w-full bg-transparent border-none focus:outline-none"
                                    placeholder="Send a message..."
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                        </>
                    )}
                </div>
            </section>
            <section className="w-2/3 flex flex-col h-fullscreen">
                <div id="control-panel" className="flex justify-between">
                    <div className="flex gap-3">
                        <Button variant={'primary'} onClick={handleRunTests}>
                            <PlayIcon fill="white" height="18px" width="18px" className="mr-2" />
                            Run tests
                        </Button>
                        <Button className="bg-green hover:bg-green-dark">
                            <SubmitIcon fill="white" className="mr-2" />
                            Submit
                        </Button>
                    </div>
                    <div className="flex flex-row">
                        <UserAvatar
                            username={
                                matchData?.user1Id === sessionData?.user.id
                                    ? matchData?.user2Name
                                    : matchData?.user1Name
                            }
                            isOnline={isOtherUserOnline}
                        />
                        <Button className="bg-red hover:bg-red-dark" onClick={handleEndSession}>
                            <EndIcon fill="white" className="mr-2" />
                            End session
                        </Button>
                    </div>
                </div>
                <div id="editor-container" className="mt-4">
                    <div id="language-mode-select" className="rounded-t-xl bg-black">
                        <LanguageModeSelect
                            displayValue={editorLanguage}
                            setDisplayValue={setEditorLanguage}
                            onSelectChange={handleLanguageModeSelect}
                            className="w-max text-white bg-neutral-800 rounded-tl-lg"
                        />
                    </div>
                    <CodeMirrorEditor roomId={id as string} language={getCodeMirrorLanguage(editorLanguage)} />
                </div>
                <CustomTabs
                    tabs={testTabs}
                    handleActiveTabChange={handleActiveTestTabChange}
                    isBottomBorder={true}
                    className="mt-4 border-2 rounded-t-lg border-slate-100"
                />
                <div
                    id="test-results-container"
                    className="border-2 rounded-lg border-t-0 rounded-t-none border-slate-100 flex-grow overflow-y-auto"
                >
                    <div className="m-4 flex overflow-x-auto">
                        {activeTestTab === 0 ? (
                            <TestcasesTab testcases={testCasesData} />
                        ) : (
                            <div className="text-sm text-slate-400">No test results yet</div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}