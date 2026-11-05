export function validatePractice(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return '请求格式不正确';
  if (typeof input.bookId !== 'string' || typeof input.unitId !== 'string') return '缺少书籍或小节';
  if (!Array.isArray(input.messages) || input.messages.length > 12) return '练习记录长度不正确';
  for (const item of input.messages) {
    if (!item || !['user', 'assistant'].includes(item.role) || typeof item.content !== 'string' || !item.content.trim() || item.content.length > 2000) return '练习消息格式不正确';
  }
  const expectedRoles = input.messages.every((item, index) => item.role === (index % 2 === 0 ? 'user' : 'assistant'));
  if (!expectedRoles || (input.messages.length > 0 && input.messages.at(-1).role !== 'user')) return '请按对话次序提交练习';
  return null;
}

export function scriptedPractice(messages) {
  const answers = messages.filter(item => item.role === 'user');
  if (answers.length === 0) {
    return { mode: 'scripted-demo', phase: 'practice', reply: '我来扮演仓库主管老陈。新系统明天就要上线，可旧表格一直能用。我对这次安排有顾虑。你想先了解什么？', feedback: [] };
  }
  if (answers.length === 1) {
    return { mode: 'scripted-demo', phase: 'practice', reply: '我最担心的是重复工作：旧表格还要填，新系统也要录。同一批货要做两遍，而且晚班还没有电脑。你准备怎样了解和处理这两件事？', feedback: [] };
  }
  if (answers.length === 2) {
    return { mode: 'scripted-demo', phase: 'practice', reply: '如果能明确哪些旧记录可以停，并让晚班有设备，我愿意试。但我还需要有人带着操作一遍。你能把负责人、下一步和检查时间说明白吗？', feedback: [] };
  }
  return {
    mode: 'scripted-demo',
    phase: 'feedback',
    reply: '这一轮脚本演示结束。请对照下面的观察问题检查自己的表达，再换一个场景独立试一次。',
    feedback: [
      `你写过：“${answers[0].content}”。请对照这句原话检查是否先了解了具体困难，再判断态度。这是脚本自查提示，不是 AI 评分。`,
      '你是否回应了重复录入、设备与培训三个条件？遗漏的部分可以在下一轮补上。',
      '你的下一步是否说明由谁负责、做什么、何时检查？这是自我检查提示，不是 AI 能力评分。'
    ]
  };
}
