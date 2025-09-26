import React, { useState } from 'react';
import { Box, Text, } from 'ink';
import { Spinner, TextInput } from '@inkjs/ui'
import { ColorName } from 'chalk';
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
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false)
	const getMessage = (value: string) => {
		setLoading(true)
		setTimeout(() => {
			setLoading(false)
			setMessages((p) => {
				return [
					...p,
					{ role: 'assistant', message: `You said ${value}` }
				]
			})
		}, 1000)
	}
	const addText = (value: string) => {
		setMessages((p) => {
			return [
				...p,
				{ role: "user", message: value },
			]
		})
		getMessage(value)
	}
	return (
		<Box gap={1} flexDirection='column' >
			<Box flexDirection='column' gap={1}>
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
