'use client';

import { useState, useEffect, useRef } from 'react';
import { GameState } from '@/lib/prompts';
import { MOCK_SQUARE } from '@/lib/square';

export default function Home() {
    const [state, setState] = useState<GameState>({
        pullBarPosition: 0,
        declineCount: 0,
        turnCount: 0,
        history: [],
        isGameOver: false,
        isAutoBattle: false,
    });
    const [view, setView] = useState<'square' | 'battle'>('square');
    const [loading, setLoading] = useState(false);
    const [userToken, setUserToken] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check for token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            setUserToken(token);
            window.history.replaceState({}, document.title, "/");
            fetchPersonality(token);
        }
    }, []);
    useEffect(() => {
        if (state.isAutoBattle && !state.isGameOver && !loading && view === 'battle') {
            const timer = setTimeout(() => {
                nextTurn();
            }, 1500); // 1.5s delay between AI turns
            return () => clearTimeout(timer);
        }
    }, [state.isAutoBattle, state.isGameOver, state.turnCount, loading, view]);

    const fetchPersonality = async (token: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/user-personality?token=${token}`);
            const data = await res.json();
            if (data.error) {
                console.error('Personality Fetch Error:', data.error);
                return;
            }
            setState(prev => ({
                ...prev,
                userB: data, // Current user is the Receiver (default)
            }));
        } catch (err) {
            console.error('Fetch Personality Exception:', err);
        } finally {
            setLoading(false);
        }
    };

    const startChallenge = (opponent: any) => {
        setState(prev => ({
            ...prev,
            userA: {
                nickname: opponent.name,
                avatar: opponent.avatar,
                personality: opponent.personality
            },
            history: [],
            turnCount: 0,
            pullBarPosition: 0,
            declineCount: 0,
            isGameOver: false,
            isAutoBattle: opponent.type === 'user' // Auto-battle for User Agents
        }));
        setView('battle');
    };

    const handleLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_SECONDME_CLIENT_ID || '27477c1e-d26d-482b-9110-684a8f3f7b62';
        const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback`);
        window.location.href = `https://go.second.me/oauth/?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=user.info`;
    };

    const nextTurn = async () => {
        if (state.isGameOver) return;
        setLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state }),
            });
            const data = await res.json();
            if (data.error) {
                alert('API 错误: ' + data.error);
                return;
            }
            setState(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetGame = () => {
        setState(prev => ({
            ...prev,
            pullBarPosition: 0,
            declineCount: 0,
            turnCount: 0,
            history: [],
            isGameOver: false,
            isAutoBattle: false,
        }));
    };

    return (
        <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 mb-2">
                    AI 极限推拉模拟器
                </h1>
                <p className="text-gray-400 mb-6 font-medium">The Art of Decline: 红包极限广场</p>

                {!userToken ? (
                    <button
                        onClick={handleLogin}
                        className="mt-4 px-8 py-3 glass hover:bg-white/10 text-sm font-bold flex items-center mx-auto space-x-2 transition-all hover:scale-105"
                    >
                        <span>✨ 接入 Second Me 开启广场</span>
                    </button>
                ) : (
                    <div className="mt-4 flex flex-col items-center space-y-2">
                        <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-1 rounded-full">
                            <span className="text-xs text-green-500 font-bold">● 已连接: {state.userB?.nickname}</span>
                        </div>
                        {view === 'battle' && (
                            <button onClick={() => setView('square')} className="text-xs text-gray-400 underline hover:text-white transition-colors">返回广场</button>
                        )}
                    </div>
                )}
            </div>

            {view === 'square' ? (
                <div className="w-full space-y-12 animate-in fade-in zoom-in duration-500">
                    {/* NPC Section */}
                    <div>
                        <h2 className="text-xl font-bold text-red-100/80 mb-6 flex items-center space-x-2">
                            <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                            <span>官方 NPC 长辈馆</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {MOCK_SQUARE.filter(a => a.type === 'npc').map((agent) => (
                                <div
                                    key={agent.id}
                                    className="glass p-6 flex flex-col items-center text-center space-y-4 hover:border-red-500/50 transition-all cursor-pointer group hover:bg-white/5"
                                    onClick={() => startChallenge(agent)}
                                >
                                    <div className="relative">
                                        <img src={agent.avatar} alt={agent.name} className="w-24 h-24 rounded-full border-2 border-red-500/30 group-hover:border-red-500 transition-all" />
                                        <div className="absolute -bottom-1 -right-1 bg-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-black italic">LV.99</div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-100 group-hover:text-red-400 transition-colors uppercase tracking-tight">{agent.name}</h3>
                                        <div className="flex flex-wrap justify-center gap-1 mt-1">
                                            {agent.shades.map(s => <span key={s} className="text-[10px] bg-red-900/40 px-2 py-0.5 rounded text-red-200 border border-red-500/20">#{s}</span>)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 italic leading-relaxed h-8 line-clamp-2">“{agent.personality}”</p>
                                    <button className="w-full py-2.5 cny-gradient text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg shadow-red-900/50">
                                        发起拉扯挑战
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Divider with text */}
                    <div className="relative py-4 flex items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink mx-4 text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Second Me 用户 A2A 专区</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* User Agent Section */}
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Logged in User's own Agent Section */}
                            {userToken && (
                                !state.userB || !state.userB.nickname ? (
                                    <div className="glass p-6 flex flex-col items-center justify-center text-center space-y-4 border-white/20 opacity-60 animate-pulse">
                                        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                                            <span className="text-2xl">🧬</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-24 bg-white/10 rounded mx-auto"></div>
                                            <div className="h-3 w-32 bg-white/10 rounded mx-auto"></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">同步您的 Agent 中...</span>
                                    </div>
                                ) : (
                                    <div
                                        className="glass p-6 flex flex-col items-center text-center space-y-4 border-green-500/50 hover:border-green-500 transition-all cursor-pointer bg-green-500/5 group"
                                        onClick={() => startChallenge({
                                            id: 'my-clone',
                                            name: `${state.userB?.nickname} (我的分身)`,
                                            avatar: state.userB?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
                                            personality: state.userB?.personality || '',
                                            shades: ['我的性格', '数字分身'],
                                            type: 'user'
                                        })}
                                    >
                                        <div className="relative">
                                            <img src={state.userB.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=me'} alt="My Clone" className="w-24 h-24 rounded-full border-2 border-green-500 group-hover:scale-105 transition-all" />
                                            <div className="absolute -bottom-1 -right-1 bg-green-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-black italic uppercase">Active</div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-green-100 uppercase tracking-tight">{state.userB.nickname}</h3>
                                            <div className="flex flex-wrap justify-center gap-1 mt-1">
                                                <span className="text-[10px] bg-green-900/40 px-2 py-0.5 rounded text-green-200 border border-green-500/20">#我的分身</span>
                                                <span className="text-[10px] bg-green-900/40 px-2 py-0.5 rounded text-green-200 border border-green-500/20">#已同步</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 italic leading-relaxed h-8 line-clamp-2">
                                            您的数字人格：{state.userB.personality?.substring(0, 50) || '正在读取人格...'}...
                                        </p>
                                        <button className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-[10px] font-bold rounded-lg shadow-lg shadow-green-900/50 transition-all hover:brightness-110">
                                            查看我的分身拉扯
                                        </button>
                                    </div>
                                )
                            )}

                            {MOCK_SQUARE.filter(a => a.type === 'user').map((agent) => (
                                <div
                                    key={agent.id}
                                    className="glass p-6 flex flex-col items-center text-center space-y-4 hover:border-yellow-500/50 transition-all cursor-pointer group hover:bg-white/5"
                                    onClick={() => startChallenge(agent)}
                                >
                                    <div className="relative">
                                        <img src={agent.avatar} alt={agent.name} className="w-24 h-24 rounded-full border-2 border-yellow-500/30 group-hover:border-yellow-500 transition-all" />
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-black italic">CLONE</div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-yellow-100 group-hover:text-yellow-400 transition-colors tracking-tight">{agent.name}</h3>
                                        <div className="flex flex-wrap justify-center gap-1 mt-1">
                                            {agent.shades.map(s => <span key={s} className="text-[10px] bg-yellow-900/40 px-2 py-0.5 rounded text-yellow-200 border border-yellow-500/20">#{s}</span>)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 italic leading-relaxed h-8 line-clamp-2">“{agent.personality}”</p>
                                    <button className="w-full py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg shadow-yellow-900/50">
                                        开启 A2A 对垒
                                    </button>
                                </div>
                            ))}

                            {!userToken && (
                                <div
                                    className="glass p-6 flex flex-col items-center justify-center text-center space-y-2 opacity-40 border-dashed border-2 border-white/20 hover:opacity-100 cursor-pointer transition-all"
                                    onClick={handleLogin}
                                >
                                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl">+</div>
                                    <span className="text-xs font-bold">同步您的 Agent</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-2xl flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center bg-white/5 py-2 px-4 rounded-full border border-white/10">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">当前模式: {state.userB?.nickname ? 'A2A 巅峰对决' : '关卡挑战'}</span>
                        <div className="flex items-center space-x-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-red-500 uppercase">LIVE BATTLE</span>
                        </div>
                    </div>

                    {/* Pull Bar */}

                    {/* Pull Bar */}
                    <div className="w-full glass p-6 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] text-gray-500 uppercase">送礼方</span>
                                <span className="text-xs font-bold text-red-400">{state.userA?.nickname || '二叔'}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-500 uppercase">收礼方</span>
                                <span className="text-xs font-bold text-yellow-400">{state.userB?.nickname || '我'}</span>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <span>坚决拒绝</span>
                            <span>心领神会</span>
                            <span>被迫收下</span>
                        </div>
                        <div className="pull-bar-container">
                            <div
                                className="pull-bar-accent"
                                style={{ width: `${(state.pullBarPosition + 100) / 2}%` }}
                            />
                        </div>
                        <div className="flex justify-center">
                            <span className="text-sm bg-red-900/50 px-3 py-1 rounded-full text-red-200">
                                拒绝次数: {state.declineCount} / 3
                            </span>
                        </div>
                    </div>

                    {/* Chat Display */}
                    <div
                        ref={scrollRef}
                        className="w-full h-96 glass overflow-y-auto p-4 space-y-4"
                    >
                        {state.history.length === 0 && (
                            <div className="text-center text-gray-500 mt-20">点击“开始拉扯”开启巅峰对决</div>
                        )}
                        {state.history.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'giver' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'giver' ? 'bg-red-800/40' : 'bg-gray-800/60 border border-gray-700'}`}>
                                    <div className="text-xs font-bold mb-1 opacity-50 uppercase tracking-tighter">
                                        {msg.role === 'giver' ? `🧧 ${state.userA?.nickname || '二叔'}` : `🙇‍♂️ ${state.userB?.nickname || '我'}`}
                                    </div>
                                    <p className="text-sm">{msg.content}</p>
                                    {msg.innerOS && (
                                        <div className="inner-os text-xs mt-2 border-t border-white/5 pt-2">
                                            <span className="opacity-50">内心 OS: </span>{msg.innerOS}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-center text-xs text-gray-500 animate-pulse">AI 正在斟酌措辞...</div>}
                    </div>

                    <div className="w-full flex space-x-4">
                        {!state.isGameOver ? (
                            state.isAutoBattle ? (
                                <div className="flex-1 py-4 text-center bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 animate-pulse uppercase tracking-[0.2em]">
                                    A2A 模拟运行中... 请欣赏对垒
                                </div>
                            ) : (
                                <button
                                    disabled={loading}
                                    onClick={nextTurn}
                                    className="flex-1 cny-gradient py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {state.turnCount === 0 ? '🧧 开始拉扯' : '继续推进'}
                                </button>
                            )
                        ) : (
                            <div className="flex-1 space-y-4">
                                <div className="text-center p-4 glass border-yellow-500/30">
                                    <h2 className="text-2xl font-bold text-yellow-500 mb-2">
                                        {state.result === 'accepted' ? '🌟 完美收官！(收下了)' :
                                            state.result === 'rejected' ? '😅 太猴急了... (没演好)' :
                                                '😭 演砸了... (真被收回去了)'}
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        {state.result === 'accepted' ? '你在保持体面的同时也拿到了压岁钱。' :
                                            state.result === 'rejected' ? '你表现得太贪财了，亲戚背地里摇了摇头。' :
                                                '对方以为你是真的不想要，顺势揣回了兜里。'}
                                    </p>
                                </div>
                                <button
                                    onClick={resetGame}
                                    className="w-full glass py-4 font-bold hover:bg-white/10 transition-colors"
                                >
                                    重新演戏
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
