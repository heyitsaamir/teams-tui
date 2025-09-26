import React, { useState } from 'react';
import { Box, Text, } from 'ink';
import { Spinner, TextInput } from '@inkjs/ui'
import { ColorName } from 'chalk';
import { useWebSocket } from './hooks/useWebSocket.js';
type Props = {
	name: string | undefined;
};

type Message = {
	message: string;
	role: 'user' | 'assistant'
}

const Message = ({ message, role }: Message) => {
	const color: ColorName | undefined = role === 'user' ? 'grey' : undefined
	return <Box gap={1}>
		<Text color={color}>{role === 'user' ? '>' : '●'}</Text>
		<Text color={color}>{message}</Text>
	</Box>
}

export default function App({ }: Props) {
	const { isConnected, sendMessage, messages, metadata } = useWebSocket('ws://localhost:3979/devtools/sockets');
	const [loading, setLoading] = useState(false)

	const addText = (value: string) => {
		setLoading(true)
		sendMessage(value)
		// Reset loading when we get a response (this could be improved)
		setTimeout(() => setLoading(false), 2000)
	}
	return (
		<Box gap={1} flexDirection='column' >
			<Box flexDirection='column' gap={1}>
				<Text color="green">
					{isConnected ? '● Connected to devtools' : '○ Disconnected from devtools'}
				</Text>
				{metadata && (
					<Text color="grey">Bot: {metadata.name || metadata.id || 'Unknown'}</Text>
				)}
				{messages.map((m, i) => <Message key={i} message={m.message} role={m.role} />)}
			</Box>
			<Box flexDirection='column'>
				{loading && <Spinner label='Typing' />}
				<Box gap={1} borderStyle="round" borderColor="grey">
					<Text>{'>'}</Text>
					<TextInput key={messages.length} onSubmit={(value) => addText(value)} />
				</Box>
			</Box>
		</Box>
	);
}
