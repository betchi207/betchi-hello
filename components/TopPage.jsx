import React from 'react';
import ReactDOM from 'react-dom';

import HeadRoom from 'react-headroom';

import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import {Tabs, Tab} from 'material-ui/Tabs';
import Snackbar from 'material-ui/Snackbar';
import RefreshIndicator from 'material-ui/RefreshIndicator';

import {MentoringList} from './content.jsx';
import {Tabbar} from './Tabbar.jsx';

import {SearchPage} from './SearchPage.jsx';

export class TopPage extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			mentorings: [],
			snack: {
				open: false,
				message: '',
			},
			refreshStyle: {
				position: 'relative',
				display: 'inline-block',
			},
			searchBoxStyle: {
				position: 'fixed',
				top: 0,
				width: '100%',
				height: '64px',
				zIndex: 0,
			},
			category: 'business',
			page: 1,
		};
		this.onDrawerToggle = this.onDrawerToggle.bind(this);
		this.onSnackClose = this.onSnackClose.bind(this);
		this.loadContents = this.loadContents.bind(this);
		this.onScroll = this.onScroll.bind(this);
		this.onSearchOpen = this.onSearchOpen.bind(this);
	}

	componentWillMount() {
		if (sessionStorage.user.swagchat_id === undefined) {
			async function asyncFunc(self) {
				//let swagchatUserInfo = {
				//	name: sessionStorage.user.username,
				//	pictureUrl: sessionStorage.user.avatar,
				//};
				//const postSwagchatUser = await self.postSwagchatUser(swagchatUserInfo);

				//let userInfo = {
				//	id: sessionStorage.user.id,
				//	swagchat_id: postSwagchatUser.userId,
				//};
				//await self.postUser(userInfo);
			}
			asyncFunc(this);
		}
	}

	postSwagchatUser(userInfo) {
		const p = new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.open('POST', this.context.swagchat.config.apiBaseUrl + '/users');
			xhr.onload = function() {
				if (xhr.status !== 201) {
					return;
				}
				let data = JSON.parse(xhr.responseText);
				resolve(data);
			};
			xhr.onerror = function() {
				return;
			};
			xhr.setRequestHeader("Content-type", "application/json");
			xhr.send(JSON.stringify(userInfo));
		});
		return p;
	}

	postUser(userInfo) {
		new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.open('POST', '/api/user', false);
			xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
			xhr.onload = () => {
				if (xhr.status !== 200) {
					this.setState({
						snack: {
							open: true,
							message: '通信に失敗しました。',
						},
						refreshStyle: {
							display: 'none',
						},
						changeUsername: this.state.user.username,
					});
					return;
				} else {
					console.log("swagchatId=" + data.userId);
					let user = sessionStorage.user;
					user.swagchat_id = data.userId;
					sessionStorage.setItem("user", user);
				}
			}
			xhr.send(JSON.stringify(userInfo));
		});
	}

	componentDidMount() {
		this.loadContents();
	}

	componentWillReceiveProps(nextProps) {
		window.removeEventListener('scroll', this.onScroll);
		this.loadContents();
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.onScroll);
	}

	loadContents(category = 'business', page = 1) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', '/api/mentorings/' + category + '/' + page);
		xhr.onload = () => {
			if (xhr.status !== 200) {
				this.setState({
					snack: {
						open: true,
						message: '通信に失敗しました。',
					},
					refreshStyle: {
						display: 'none',
					},
				});
				return;
			}
			let mentorings = [];
			let data = JSON.parse(xhr.responseText);
			if (page === 1) {
				mentorings = data.mentorings;
			} else {
				mentorings = this.state.mentorings.slice();
				for (var ii in data.mentorings) {
					mentorings.push(data.mentorings[ii]);
				}
			}
			this.setState({
				mentorings: mentorings,
				category: category,
				page: page,
			});

			if (mentorings.length == 0) {
				this.setState({
					snack: {
						open: true,
						message: '検索ヒット0件です。',
					},
					refreshStyle: {
						display: 'none',
					},
				});
				return;
			}
			if (page === 1) {
				window.scrollTo(0,0);
			}

			if (!data.hasNext) {
				this.setState({
					refreshStyle: {
						display: 'none',
					},
				});
			} else {
				window.addEventListener('scroll', this.onScroll);
			}
		}
		this.setState({
			refreshStyle: {
				position: 'relative',
				display: 'inline-block',
			},
		});
		xhr.send();
	}

	onScroll(e) {
		let body = window.document.body;
		let html = window.document.documentElement;
		let scrollTop = body.scrollTop || html.scrollTop;
		let bottom = html.scrollHeight - html.clientHeight - scrollTop;
		if (bottom <= 60) {
			window.removeEventListener('scroll', this.onScroll);
			this.loadContents(this.state.category, this.state.page + 1);
		}
	}

	onDrawerToggle(e) {
		this.refs.drawerMenu.onToggle();
	}

	onSearchOpen(e) {
		this.context.router.push('/search');
	}

	onSnackClose(e) {
		this.setState({
			snack: {
				open: false,
				message: '',
			}
		})
	}

	render() {
		const user = sessionStorage.user;
		const styles = {
			headroom: {
				WebkitTransition: 'all .3s ease-in-out',
				MozTransition: 'all .3s ease-in-out',
				OTransition: 'all .3s ease-in-out',
				transition: 'all .3s ease-in-out',
				zIndex: '10000',
			},  
			brandBar: {
				height: '2rem',
				lineHeight: '2rem',
				width: '100%',
				textAlign: 'center',
				letterSpacing: '5px',
				fontWeight: 'bold',
				fontSize: '1.1rem',
				zIndex: '10001',
				color: this.context.colors.text1,
				backgroundColor: this.context.colors.bg1,
			},  
			title: {
				fontSize: '1.2rem',
				fontWeight: 'bold',
			},  
			refreshBox: {
				position: 'relative',
				margin: '16px 0',
				width: '100%',
			},  
			refreshMargin: {
				width: '40px',
				margin: 'auto',
			},  
		}
		return (
			<section>
				<HeadRoom
					style={styles.headroom}
				>
					<div style={styles.brandBar}>mentor</div>
					<TopTab loadContents={this.loadContents} />
				</HeadRoom>
				<SearchPage />
				<MentoringList
					mentorings={this.state.mentorings}
					category={this.state.category}
				/>
				<div style={styles.refreshBox}>
					<div style={styles.refreshMargin}>
						<RefreshIndicator
							size={40}
							left={0}
							top={0}
							status="loading"
							style={this.state.refreshStyle}
						/>
					</div>
				</div>
				<Snackbar
					open={this.state.snack.open}
					message={this.state.snack.message}
					autoHideDuration={4000}
					onRequestClose={this.onSnackClose}
				/>
				<Tabbar value={"top"} />
			</section>
		);
	}
}
TopPage.contextTypes = {
	router: React.PropTypes.object.isRequired,
	colors: React.PropTypes.object.isRequired,
	swagchat: React.PropTypes.object.isRequired,
}

export class TopTab extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			tab: 0,
		};
		this.onChangeTab = this.onChangeTab.bind(this);
	}

	onChangeTab(tab) {
		this.setState({
			tab: tab,
		});
		let category = this.context.categories[tab];
		this.props.loadContents(category.value);

		// scroll tab
		let box = document.getElementById("tab-box");
		let tabs = 9;
		let scrollLeftMax = box.scrollWidth - box.clientWidth;
		if (tab > 2) {
			let pos = (box.scrollWidth / tabs) * (tab - 2);
			if (pos > scrollLeftMax) {
				pos = scrollLeftMax;
			}
			this.scrollTab(box.scrollLeft, pos);
		} else {
			this.scrollTab(box.scrollLeft, 0);
		}
	}

	scrollTab(cur, pos) {
		if (cur == pos) {
			return;
		}

		let box = document.getElementById("tab-box");
		const step = Math.abs((Math.abs(pos) - Math.abs(cur))) / 10;
		if (pos > cur) {
			const interval = setInterval(() => {
				if (box.scrollLeft < pos) {
					box.scrollLeft += step;
				} else {
					clearInterval(interval);
				}
			}, 15);
		} else {
			const interval = setInterval(() => {
				if (box.scrollLeft > pos) {
					box.scrollLeft -= step;
				} else {
					clearInterval(interval);
				}
			}, 15);
		}
	}

	render() {
		const styles = {
			root: {
				overflow: 'hidden',
			},
			tabsBox: {
				overflowX: 'scroll',
				WebkitOverflowScrolling: 'touch',
				WebkitTransform: 'translateZ(0px)',
			},
			tabs: {
				width: '260%',
			},
			tab: {
				letterSpacing: '2px',
				backgroundColor: this.context.colors.bg1,
				fontSize: '1.1rem',
				fontWeight: 'bold',
				color: this.context.colors.text1,
			},
		};
		return (
			<div style={styles.root}>
				<div style={styles.tabsBox} id="tab-box">
					<Tabs
						value={this.state.tab}
						onChange={this.onChangeTab}
						style={styles.tabs}
						inkBarStyle={{backgroundColor:this.context.colors.fluorescent1}}
					>
						{this.context.categories.map(function(row, index) {
							return (
								<Tab style={styles.tab} key={row.value} label={row.label} value={index} />
							);
						})}
					</Tabs>
				</div>
			</div>
		);
	}
}
TopTab.contextTypes = {
	router: React.PropTypes.object.isRequired,
	categories: React.PropTypes.array.isRequired,
	colors: React.PropTypes.object.isRequired,
}

TopTab.propTypes = {
	loadContents: React.PropTypes.func.isRequired
}
