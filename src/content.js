import { BrowserRouter as Router, Route, Link ,NavLink} from "react-router-dom";
import React, { Component } from 'react';
import Ctx  from './appData';
	
	
export default class Content extends Component {
	render() {
		const catalogs=[{style:"fire text-danger",label:"世界杯"},{style:"fire text-primary",label:"足球"},{style:"basketball-ball text-primary",label:"篮球"},{style:"volleyball-ball text-primary",label:"排球"},{style:"table-tennis text-primary",label:"乒乓球"},{style:"golf-ball text-primary",label:"高尔夫"},{style:"chess-knight text-primary",label:"棋牌"},{style:"trophy text-primary",label:"格斗"},{style:"gamepad text-primary",label:"电子竞技"},{style:"suitcase text-primary",label:"商业"},{style:"fighter-jet text-primary",label:"军事"},{style:"globe text-primary",label:"其他"}];
    return (
		<Router >
		<div className="row">
			<nav className="col-2 sidebar ">
				<div className="sidebar-sticky">
						<ul className="nav flex-column">
						{catalogs.map((catalog,i)=>
							<li key={i.toString()} className="nav-item">
								<NavLink className={"nav-link "+catalog.style} to={"/channel-"+i} activeClassName='current'>
									<i className={"fa fa-lg text-primary fa-"+catalog.style}></i> {catalog.label}
								</NavLink>
							</li>
						)}
						<br />
							<li key="12" className="nav-item">
								<NavLink className="nav-link text-success" to="/channel-12"  activeClassName='current'>
									<i className="fa fa-lg fa-copy text-success "></i> 我的竞猜 <span className="badge badge-pill badge-success">119</span>
								</NavLink>
							</li>
						</ul>
						<br/>
				</div>
			</nav>
			<Route exact path="/" render={(props) => <Games {...props} />}/>
			<Route path="/channel-:id" render={(props) => <Games {...props} />}/>
		</div>
		</Router>
    );
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Main body
///////////////////////////////////////////////////////////////////////////////////////////////////////////
var web3 = window.web3;
var myContract = web3.eth.contract(Ctx.abi).at(Ctx.addr);
const categ=["世界杯","足球","篮球","排球","乒乓球","高尔夫","棋牌","格斗","电子竞技","商业","军事","其他"];
class	TimeOut extends Component{
	constructor(props){
		super(props)
		this.state = {time:Date.now()};
	}
	componentWillReceiveProps(nextProps){
		setInterval(this.setState({time:Date.now()}), 1000);
	}
	render() {
		return(
			<h5>Now: {new Date().toLocaleTimeString()}.</h5>
	)}
}
export class Games extends Component {
	constructor(props){
		super(props)
		this.state = {title:"",gameTime:"",home:"",away:"",homeIcon:"",awayIcon:"",category:"",games:[],oGames:[],funs:[],oFuns:[]};
    this.submit = this.submit.bind(this);
		this.inChange = this.inChange.bind(this);
	}
	componentWillMount(){
		myContract.Referee({ from: Ctx.adAddr, gas: 400000, gasPrice: 2e10 },  (err, tx)=> {
				if (err) return false;
				this.setState({Referee:tx})
				console.log("Game component Will mount, Referee:",tx);
		});
		let arr=[];
		let funs=[];
		myContract.gameCount({ from: Ctx.adAddr, gas: 400000, gasPrice: 2e10 }, (err2,n)=>{
			//console.log("there are : "+n+" Games")
			for (let i =0;i<n;i++){
					myContract.gameId(i,{ from: Ctx.adAddr, gas: 400000, gasPrice: 2e10 },(err3,gid)=>{
						//console.log("the game id is :"+gid);
						myContract.mGame(gid,{ from: Ctx.adAddr, gas: 400000, gasPrice: 2e10 },(err4,gm)=>{
								arr.push(gm);
								if(i===n-1){
									this.setState({games:arr});
									this.setState({oGames:arr});
									//console.log(JSON.stringify(this.state.games));
								}
							})
						myContract.BetView(gid,{ from: Ctx.adAddr, gas: 400000, gasPrice: 2e10 },(err5,fun)=>{
								funs.push(fun);
								if(i===n-1){
									this.setState({funs:funs});
									this.setState({oFuns:funs});
									//console.log(JSON.stringify(this.state.funs));
								}
							})
					})
			}
		})
	}
	componentWillReceiveProps (nextProps) {
		let id = nextProps.match.params.id;//console.log(JSON.stringify(this.state.oGames),nextProps.match.params.id)
		let all=this.state.oGames;
		this.setState({games:all.filter(game => game[6] == id)})
	}
	gameStatus (iResult){
		switch(iResult)
		{
			case "0": return "待审核";
			case "1":	return "开放";
			case "2":	return "锁定";
			case "3":	return "取消";
			case "4":	return "结算中";
			case "5":	return "结束";
			default:	return "未知状态";
		}
	}
  submit(e) {
		e.preventDefault()
		let category=parseInt(this.state.category)
		let locktime=Date.parse(this.state.gameTime)
		//alert('Game time: '+locktime)
		if(this.state.homeIcon.length<10) this.state.homeIcon="https://image.ibb.co/j9maLo/home.jpg"
		if(this.state.awayIcon.length<10) this.state.awayIcon="https://image.ibb.co/m5Szfo/Away.png"
		myContract.CreateBet(this.state.title,this.state.home,this.state.homeIcon,this.state.away,this.state.awayIcon,category, locktime, 
				{ from:this.state.adAddr, gas: 400000, gasPrice: 2e10 }, (err, tx) =>{
						if (err) return false;
						//console.log("Creating game successfull!");
		});
  }
	inChange(event){
    this.setState({[event.target.name]: event.target.value} );
	}
  render() {
    return (
			<div className="col-10">
			<Router>
				<div className="row">
					<ul className="list-unstyled col-8" >
						<li className="my-4" >
							<a className="btn btn-success " data-toggle="collapse" href="#newGame" role="button" aria-expanded="false" aria-controls="newGame">创建新竞猜 </a> 
							<a className="text-info float-right py-3">用户 0x794414 新创建 【UFC格斗】 竞猜 ： <a className="text-success"> “v大师的卡萨丁”</a></a>
						</li>
						<li className="collapse border border-gray rounded p-3 my-3 bg-white shadow" id="newGame">
							<form onSubmit={this.submit}>
								<h5 className="text-primary ">创建新竞猜：(提交前请仔细核对信息，创建成功后将不可更改！)</h5><br/>
								<div className="row mb-3 align-items-center">
										<label className="col-2 form-input-label " htmlFor="gameTitle">请输入标题：</label>
										<input type="text" className="col-9 form-control" id="gameTitle" value={this.state.title} name='title' onChange={this.inChange} required/>
								</div>
								<div className="row mb-3 align-items-center">
										<label className="col-2 form-input-label " htmlFor="category">选择比赛类型：</label>
										<select className="col-9 form-control text-primary" id="category" value={this.state.category} name='category' onChange={this.inChange} >
											<option value="11" >Choose...</option>
											{categ.map((cat,i)=>
												<option value={i} key={i}>{cat}</option>
											)}
										</select>
								</div>
								<div className="row mb-3 align-items-center">
										<label className="col-2 form-input-label" htmlFor="gameTime" >比赛时间：</label>
										<input type="Date" className="col-9 form-control" id="gameTime" name='gameTime' onChange={this.inChange} required/>
								</div>
								<div className="row mb-3 align-items-center">
										<label className="col-2 form-input-label" htmlFor="gameTime">竞猜裁判：</label>
										<input type="text" className="col-9 form-control" placeholder="0x0E807c3Aa2D37B8fF01d6A4d1A593F0E720F4D0c" id="gameTime" disabled/>
								</div>
								<br/>
								<div className="row mb-3 align-items-center">
										<p className="col-12 form-input-label">输入对战双方信息：</p>
										<span className="col-2"> 名称：</span>
										<input type="text" className="col-4 form-control" id="teamA" name='home' onChange={this.inChange} required />
										<span className="col-1 text-center text-danger"> VS </span>
										<input type="text" className="col-4 form-control" id="teamB" name='away' onChange={this.inChange} required/>
								</div>
								<div className="row mb-3 align-items-center">
										<span className="col-2"> 头像： </span>
										<input type="text" className="col-4 form-control" name='homeIcon' defaultValue="https://image.ibb.co/j9maLo/home.jpg" onChange={this.inChange} />
										<span className="col-1 text-center text-danger"> VS </span>
										<input type="text" className="col-4 form-control" name='awayIcon' defaultValue="https://image.ibb.co/m5Szfo/Away.png" onChange={this.inChange} />
								</div>
								<div className="row ">
									<button type="submit" className="btn btn-success ml-auto mr-4 mt-4">创建竞猜</button>
								</div>
							</form>
						</li>
						{this.state.games.map((game,i)=>
								<li className=" media border border-gray rounded pl-3 mb-3 bg-white shadow" key={i.toString()}>
									<img className="align-self-center img-thumbnail rounded tfg bg-light" src={game[4]} alt="home team ICON"/>
										<div className="media-body">
											<h5 className="mt-3 mb-0 text-center"><Link to="/preview">{game[1]}</Link></h5>
											<table className="table table-borderless m-3">
												<thead>
													<tr><th></th><th scope="col"><a href="">{game[2]}</a></th><th scope="col">VS</th><th scope="col"><a href="">{game[3]}</a></th></tr>
												</thead>
												<tbody className="border-top">
													<tr><td>赔率 / 胜 平 胜</td><td><a href="" className="px-4 py-1 border bg-success text-white rounded">{i}</a></td><td><a href="" className="px-4 py-1 border bg-success text-white rounded">{i}</a></td><td><a href="" className="px-4 py-1 border bg-success text-white rounded">{i}</a></td></tr>
													<tr><td>竞猜状态</td><td colSpan="3">{this.gameStatus(game[8])}</td></tr>
													<tr><td>比赛时间</td><td colSpan="3"><TimeOut /></td></tr>
													<tr><td>竞猜裁判</td><td colSpan="3"><a href={"https://rinkeby.etherscan.io/address/"+this.state.Referee} target="_blank">{this.state.Referee}</a></td></tr>
													<tr><td>创建者</td><td colSpan="3"><a href={"https://rinkeby.etherscan.io/address/"+game[0]} target="_blank">{game[0]}</a></td></tr>
												</tbody>
											</table>
										</div>
									<img className="align-self-center img-thumbnail rounded tfg bg-light" src={game[5]} alt="away team ICON"/>
									<Share stitle="分享竞猜" looks=" align-self-end"/>
								</li>)}
				</ul>
				<Route exact path="/" render={(props) => <RightBar {...props} />}/>
				<Route path="/:id" render={(props) => <RightBar {...props} />}/>	
			</div>
		</Router>
		</div>
		);
  }
}

////////////////////////////////////////////////////////////////////////
//Right Bar
////////////////////////////////////////////////////////////////////////
const RightBar =()=> {
  return (
		<div className="col-4">
			<Router>
				<a>
					<div className="btn-group mr-2">
						<Link className="btn btn-sm btn-outline-success" to="/server">客 服</Link>
						<Link className="btn btn-sm btn-outline-success" to="/myBet">我的竞猜 <span class="badge badge-success">19</span></Link>
						<Link className="btn btn-sm btn-outline-success" to="/heros">排行榜</Link>
					</div><br/>
					<Route path="/server"  render={(props) => <Preview {...props} />}/>	
					<Route path="/myBet" render={(props) => <Orders {...props} />}/>	
					<Route path="/heros" render={(props) => <Heros {...props} />}/>	
					<Route path="/confirm"  render={(props) => <Confirm {...props} />}/>	
					<Route path="/preview"  render={(props) => <Preview {...props} />}/>	
					<Route path="/server"  render={(props) => <Confirm {...props} />}/>	
				</a>
			</Router>
		</div>
	);
};

const Heros=()=>{
	const heros=[{addr:"0x0E807c3Aa2D37B8fF01d6A4d1A593F0E720F4D0c",amout:5232,win:232,lose:22},
	{addr:"0x0E807c3Aa2D37B8fF01d6A4d1A593F0E720F4D0c",win:344,lose:1,amout:3145},
	{addr:"0x0E807c3Aa2D37732yr822A4d1A593F0E720F4D0c",win:43,lose:54,amout:440},
	{addr:"0x0E807c3Aa2D37B8fF01d6A4d1A593F0E720F4D0c",win:46,lose:6,amout:232},
	{addr:"0x0E807c3Aa2D37B8fF01d6A4d1A593F0E720F4D0c",win:3425,lose:22,amout:122},
	{addr:"0x0E807c3Aa2D37B8fF01d6A4d1A593F0E720F4D0c",win:65,lose:0,amout:53},
	{addr:"0x0E807c3Aa2D37B8fF01d6A4d1A593F0E720F4D0c",win:232,lose:8,amout:34}];
	return(
		<div className="my-5 bg-light border rounded p-4" >
			<h6 className="my-2 text-danger">战绩榜</h6><hr/>
			<h6 className="my-3 row">
				<a className="text-danger col-3"></a> 
				<a className="col-5">昵称</a> 
				<a className="col-4">战绩(<a className="text-danger">胜</a>-<a className="text-success">负</a>)</a>
			</h6>
			{heros.map((hero,i)=>
			<h6 className={(hero.addr=="0x0E807c3Aa2D37732yr822A4d1A593F0E720F4D0c")?"py-2 my-1 row isMe" : "py-2 my-1 row "}>
				<a className="badge badge-pill badge-danger col-1 text-white">{i}</a> 
				<a href={hero.addr} className="col-6">0x0E807c3Aa</a> 
				<a className="col-5">
					<a className="text-danger">{hero.win} </a> - <a className="text-success"> {hero.lose}</a>
				</a>
			</h6>
			)}<br/><br/>
			<Share stitle="分享我的战绩" looks="bt-2"/>
		
			<br /><br />
			<h6 className="my-2 text-danger">土豪榜</h6><hr/>
				<h6 className="my-3 row">
					<a className="text-danger col-3"></a> 
					<a className="col-5">昵称</a> 
					<a className="col-4">ETH</a>
				</h6>
			{heros.map((hero,i)=>
				<h6 className={(hero.addr=="0x0E807c3Aa2D37732yr822A4d1A593F0E720F4D0c")?"py-2 my-1 row isMe" : "py-2 my-1 row "}>
					<a className="badge badge-pill badge-danger col-1 text-white">{i}</a> 
					<a href={hero.addr} className="col-7">0x0E807c3Aa</a> 
					<a className="col-4">{hero.amout}</a>
				</h6>
			)}<br/><br/>
			<Share stitle="炫 富" looks="mt30"/>
		</div>);
}
const Orders =()=> {
  const orders=[{title:"2018世界杯八分之一决赛第一场",url:"",subTitle:"巴西 vs 阿根廷",betting:"巴西胜",qty:434.00,odds:2},
		{title:"WCG 2019 War3 总决赛",url:"",subTitle:"Yumike vs Fly100%",betting:"Yumike",qty:34.00,odds:4},
		{title:"UFC 2018 年度冠亚总决赛",url:"",subTitle:"Fedor Emelianenko vs kevin randleman",betting:"Fedor Emelianenko",qty:32.00,odds:3}];
  return (<a>
		{orders.map((order,i)=>
			<div className="my-4 bg-light border rounded p-4" >
				<h6 className="my-2"><a href={order.url}>{order.title}</a></h6>
				<h6 className="my-2">{order.subTitle}</h6>
				<br />
				<h6 className="my-2">您押注了：{order.betting}</h6>
				<h6 className="my-2">投注数量：{order.qty}</h6>
				<h6 className="my-2">手续费：0.00</h6>
				<h6 className="my-2">当前期望奖金：{order.qty*order.odds}</h6>
				<h6 className="my-2">当前回报率：{order.odds*100}%</h6>
				<img src="./confirm.png" alt="confirm" border="0" className="confirm" />
				<Share stitle="分享竞猜" looks=""/>
				<br/>
			</div>
		)}
	</a>);
};
export const Preview =()=> {
  return (
		<div className=" my-4 bg-light border rounded p-4" >
				<h6 className="">世界杯八分之一决赛第一场</h6>
				<fieldset className="form-group">
					<div className="row">
						<legend className="col-form-label col-sm-12 pt-0 text-secondary">选择投注目标：</legend>
						<div className="col-sm-12">
							<div className="form-check my-3">
								<input className="form-check-input " type="radio" name="gridRadios" id="gridRadios1" value="option1" />
								<label className="form-check-label mx-4" htmlFor="gridRadios1"> 巴西 胜</label>
							</div>
							<div className="form-check my-3">
								<input className="form-check-input " type="radio" name="gridRadios" id="gridRadios2" value="option2" />
								<label className="form-check-label mx-4" htmlFor="gridRadios2"> 阿根廷 胜</label>
							</div>
							<div className="form-check my-3">
								<input className="form-check-input " type="radio" name="gridRadios" id="gridRadios3" value="option3" />
								<label className="form-check-label mx-4" htmlFor="gridRadios3"> 平局</label>
							</div>
						</div>
					</div>
				</fieldset>
				<div className="form-group row">
					<label htmlFor="qty" className="col-sm-6 col-form-label text-secondary">投注数量：</label>
					<div className="col-sm-6">
						<input type="text" className="form-control" id="qty" placeholder=" 0.00" />
					</div>
				</div>
				<div className="form-group row">
					<label htmlFor="rwd" className="col-sm-6 col-form-label text-secondary">当前奖金期望：</label>
					<div className="col-sm-6">
						<input type="text" className="form-control" id="rwd" placeholder=" 253.00" disabled />
					</div>
				</div>
				<div className="form-group row">
					<div className="col-9"></div>
					<button type="submit" className="btn btn-success col-3">预 览</button>
				</div>
		</div>);
};
export const Confirm =()=> {
  return (
		<div className="card my-4 bg-light rounded p-4" >
				<h5 className="card-title text-success">请仔细审核你的投注 !</h5><br />
				<h6 className="my-2"><a href="">2018世界杯八分之一决赛第一场</a></h6>
				<h6 className="my-2">巴西 vs 阿根廷</h6>
				<h6 className="my-2">开赛时间：2018.8.21 56:55 (北京时间)</h6>
				<h6 className="my-2">竞猜裁判：<a href="">0x93243432423</a></h6>
				<br />
				<h6 className="my-2">巴西胜</h6>
				<h6 className="my-2">投注数量：8.65</h6>
				<h6 className="my-2">手续费：0.00</h6>
				<h6 className="my-2">当前期望奖金：65.87</h6>
				<h6 className="my-2">当前回报率：162.33%</h6>
				<div className="form-group row px-5 mt-5">
					<div className="col-4"></div>
					<button type="submit" className="btn btn-outline-success col-3 mx-2">返回</button>
					<button type="submit" className="btn btn-success col-3 mx-2">确 认</button>
				</div>
		</div>
    );
};
export const Share=({stitle,looks=""})=>{
	const ps="btn btn-sm btn-outline-primary float-right dropdown-toggle "
	return(<span>
			<a href="" className={ps+looks} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{stitle}</a>
			<div className="dropdown-menu ">
				<a className="dropdown-item text-primary" href="#">朋友圈</a>
				<a className="dropdown-item text-primary" href="#">QQ空间</a>
				<a className="dropdown-item text-primary" href="#">微博</a>
				<div role="separator" className="dropdown-divider"></div>
				<a className="dropdown-item text-primary" href="#">Facebook</a>
				<a className="dropdown-item text-primary" href="#">Twitter</a>
			</div>
	</span>);
}