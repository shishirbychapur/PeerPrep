import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { basicSetup } from 'codemirror'
import { yCollab, yUndoManagerKeymap } from 'y-codemirror.next'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'
import { useSession } from 'next-auth/react'
import { languages } from '@codemirror/language-data'
import { userColor } from '@/util/cursor-colors'
import { CodeMirrorEditorProps } from '@/types/editor'
import { oneDark } from '@codemirror/theme-one-dark'
import { javascript } from '@codemirror/lang-javascript'

const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({ roomId, language }) => {
    const editorContainerRef = useRef<HTMLDivElement>(null)
    // eslint-disable-next-line no-unused-vars
    const [provider, setProvider] = useState<WebsocketProvider | null>(null)
    const [ydoc] = useState(() => new Y.Doc())
    const [ytext] = useState(() => ydoc.getText('codemirror'))
    const { data: session } = useSession()
    const [editorView, setEditorView] = useState<EditorView | null>(null)
    const compartment = useMemo(() => new Compartment(), [])

    useEffect(() => {
        if (!editorView) return
        ;(async () => {
            const languageExt = languages.find((lang) => lang.alias.includes(language) || lang.name === language)
            if (!languageExt) return
            const data = await languageExt.load()
            editorView.dispatch({
                effects: compartment.reconfigure(data),
            })
        })()
    }, [editorView, language])

    useEffect(() => {
        if (!session) return
        const token = session.user.accessToken
        if (!token) return undefined
        const wsProvider = new WebsocketProvider('ws://localhost:3008', roomId, ydoc, {
            protocols: [token],
        })
        wsProvider.awareness.setLocalStateField('user', {
            name: session.user.username || 'Anonymous',
            color: userColor.color,
            colorLight: userColor.light,
        })
        if (wsProvider.ws) {
            wsProvider.ws.onclose = () => {}
        }
        setProvider(wsProvider)
        if (editorContainerRef.current) {
            const state = EditorState.create({
                doc: ytext.toString(),
                extensions: [
                    keymap.of([...yUndoManagerKeymap]),
                    basicSetup,
                    oneDark,
                    compartment.of(javascript()),
                    yCollab(ytext, wsProvider.awareness),
                ],
            })
            const view = new EditorView({
                state,
                parent: editorContainerRef.current,
            })
            setEditorView(view)
            return () => {
                wsProvider.disconnect()
                view.destroy()
            }
        }
        return undefined
    }, [editorContainerRef, ydoc, ytext, session])

    return (
        <div
            ref={editorContainerRef}
            style={{
                height: '400px',
                overflow: 'scroll',
                border: '1px solid lightgray',
                backgroundColor: '#282c34',
            }}
        />
    )
}

export default CodeMirrorEditor
