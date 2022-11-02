import { Button, Card, Dialog, DialogContent } from "@mui/material"
import { useAppDispatch } from "hooks/common";
import { useEffect, useState } from "react";
import { FisAccount, setFisAccounts } from "redux/reducers/PolkadotjsSlice";

interface Props {
	visible: boolean;
	onClose: () => void;
}

export const ConnectPolkadotjsModal = (props: Props) => {
	const dispatch = useAppDispatch();

	const [clickedStake, setClickedStake] = useState(false);

	useEffect(() => {
		if (clickedStake) {
			const conn = async () => {
				const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
				const accounts = await web3Enable('stafi/rtoken').then(async () => await web3Accounts());
				console.log(accounts)
				dispatch(setFisAccounts(accounts as FisAccount[]));
			}
			conn();
		}
	}, [clickedStake]);

	return (
		<Dialog
			open={props.visible}
			onClose={props.onClose}
			scroll="paper"
		>
			<DialogContent>
				<Card>
					<Button
						onClick={() => setClickedStake(true)}
					>
						Connect to Polkadotjs Extension
					</Button>
				</Card>
			</DialogContent>
		</Dialog>
	)
}