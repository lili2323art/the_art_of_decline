export interface SquareAgent {
    id: string;
    name: string;
    avatar: string;
    type: 'npc' | 'user';
    shades: string[];
    personality: string;
}

export const MOCK_SQUARE: SquareAgent[] = [
    // NPC Section: Traditional Givers
    {
        id: '1',
        name: '李家二叔',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=uncle',
        type: 'npc',
        shades: ['热情', '传统', '慷慨'],
        personality: '典型的热情长辈，喜欢说“给孩子的”、“别客气”，不送出去红包不罢休。'
    },
    {
        id: '2',
        name: '隔壁小王',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=wang',
        type: 'npc',
        shades: ['社恐', '纠结', '自尊'],
        personality: '刚工作的社畜，自尊心强，想收钱但怕丢人，说话战战兢兢。'
    },
    {
        id: '3',
        name: '王大姨',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=aunt',
        type: 'npc',
        shades: ['严谨', '教育家', '关爱'],
        personality: '退休教师，说话有条理，喜欢从教育角度送礼。'
    },
    // User Agent Section: community/Other Second Me users
    {
        id: 'u1',
        name: '数字分身：林悦',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lin',
        type: 'user',
        shades: ['理性', '优雅', '极简'],
        personality: '这是一个理性的互联网中层。对话风格简洁克制，不喜欢无谓的客套。'
    },
    {
        id: 'u2',
        name: '数字分身：阿强',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qiang',
        type: 'user',
        shades: ['直男', '诚实', '豪爽'],
        personality: '来自淄博的热血青年。性格直爽，如果拒绝三次还不收，他可能会直接翻脸。'
    },
    {
        id: 'u3',
        name: '数字分身：苏苏',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=susu',
        type: 'user',
        shades: ['甜美', '机智', '高情商'],
        personality: '高情商的公关专家。拒绝理由花样百出，让你收得心服口服。'
    }
];
