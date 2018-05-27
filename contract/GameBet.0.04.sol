// 胜，负，平 竞猜游戏。
// guisfteam.slack.com
// Address 0x794414bd54a41e439af9fb242f906eea73b2309c
pragma solidity ^0.4.22;
import './SafeMath.sol';
contract GameBet{
	using SafeMath for uint256;
	
	event gameCreated(bytes32 indexed game_id,address indexed creator, string home, string away, uint16 indexed category, uint64 locktime);
	event bettingStart(bytes32 indexed game_id, address bidder, uint amount, Results results);
	event gameVerified(bytes32 indexed game_id);
	event withdrawal(address indexed user, uint amount, uint timestamp);
	
	enum Status { Pending, Open, Locked, Cancel, Verified, Over }
	enum Results {Home, Away, Draw}
	address public Referee=0x0E807c3Aa2D37B8fF01d6A4d1A593F0E720F4D0c;
	struct Bet{
		address bettor;
		Results	betting;
		uint256 amount;
	}
	struct Game{
		address owner;
		string	title;
		string	home;
		string	away;
		string	hImg;
		string	aImg;
		uint16	category;
		uint64	locktime;
		Status	status;
		Results	results;
	} 
	
	mapping(bytes32 => address[]) mBettors;   // game id mapping to Bettors list.
	mapping(bytes32 => Bet[]) private mBets;	// game id mapping to Bet bid list.
	mapping(bytes32 => Game) public mGame;    // game id mapping
	bytes32[] public gameId;
	uint public gameCount=0;
	
	function CreateBet(string _title,string	_home,string	_hImg,string	_away,string	_aImg,uint16	_category,uint64 _locktime) public returns (bool){
		bytes32 id=keccak256(_home,_away,_locktime);
		require(!(mGame[id].locktime == _locktime),"Bet already exist.");
		mGame[id]=(Game({
			owner: msg.sender,
			title:_title,
			home:_home,
			hImg:_hImg,
			away:_away,
			aImg:_aImg,
			category:_category,
			locktime:_locktime,
			status:Status.Pending,
			results:Results.Draw
		}));
		gameId.push(id);
		gameCount++;
		emit gameCreated(id,msg.sender,_home, _away, _category, _locktime);
		return true;
	}
	
	function Betting(bytes32 _game_id,Results _betting) public payable returns (bool) { 
		require((mGame[_game_id].status==Status.Open),"The game bet is not valuable!");
		require(!(msg.sender == Referee),"Administror can not betting!");
		mBets[_game_id].push(Bet({bettor: msg.sender, betting: _betting, amount: msg.value}));
		mBettors[_game_id].push(msg.sender);
		emit bettingStart(_game_id, msg.sender, msg.value, _betting);
		return true;
	}
	
	function Admin(bytes32 _game_id, Results _results,Status _status) public{
		require(msg.sender==Referee);
		mGame[_game_id].results = _results;
		mGame[_game_id].status = _status;
		emit gameVerified(_game_id);
	}
	
	// 统计指定游戏的资金池，返回数组 【1】押主场胜 【2】押平局 【3】押客场胜 【4】总资金【5】总人数
	function BetView(bytes32 _game_id) public view returns (uint256[5]){
		uint256[5] memory coin;
		for (uint i = 0; i < mBets[_game_id].length; i++) {
			if(mBets[_game_id][i].betting == Results.Home){
				coin[0] = coin[0].add(mBets[_game_id][i].amount);
			}else if(mBets[_game_id][i].betting == Results.Draw){
				coin[1] = coin[1].add(mBets[_game_id][i].amount);
			}else{
				coin[2] = coin[2].add(mBets[_game_id][i].amount);
			}
			coin[3]=coin[3]add(mBets[_game_id][i].amount);
			coin[4]+=1;
		}
		return coin;
	}
	// 统计当前用户在指定游戏中赢得的硬币数 ，返回数组 【1】所有赢家的投注 【2】我的正确投注 【3】所有的失败投注
	function Funds(bytes32 _game_id) public view returns(uint256[3]){
		uint256[3] memory coin;
    for (uint i = 0; i < mBets[_game_id].length; i++) {
			if(mBets[_game_id][i].betting == mGame[_game_id].results){
				coin[0] = coin[0].add(mBets[_game_id][i].amount);
				if(mBets[_game_id][i].bettor == msg.sender){
					coin[1] = coin[1].add(mBets[_game_id][i].amount);
				}
			}else{
				coin[2] = coin[2].add(mBets[_game_id][i].amount);
			}
		}
		return coin;
	}
	
	function Bettors(bytes32 _game_id,address _bettor) private returns(bool){
		bool rtn = false;
		for(uint i=0; i<mBettors[_game_id].length;i++){
			if(mBettors[_game_id][i]==_bettor){
				delete mBettors[_game_id][i];
				rtn= true;
			}
		}
		return rtn;
	}
	
	function Withdraw(bytes32 _game_id) public {
		require(mGame[_game_id].status == Status.Verified,"Game result not verified!");
		require(Bettors(_game_id,msg.sender),"Already liquidated!");
		uint256[3] memory coin = Funds(_game_id);

		//gCoin= (lCoin*(wCoin/sCoin)+wCoin)*0.9;
		uint256 gCoin= (coin[2].mul(coin[1].div(coin[0])).add(coin[1])).mul(9).div(10);
		msg.sender.transfer(gCoin);
		emit withdrawal(msg.sender, gCoin, now);
	}
}