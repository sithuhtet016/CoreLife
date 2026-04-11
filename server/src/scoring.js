import { lifeAreas } from './data/lifeAreas.js'

export function calculateAreaScores(questions, answersByQuestionId) {
  const areaScores = {}
  for (const area of lifeAreas) {
    const areaQuestions = questions.filter((q) => q.life_area_id === area.id)
    const sum = areaQuestions.reduce((acc, q) => acc + Number(answersByQuestionId[q.id] ?? 0), 0)
    const max = areaQuestions.length * 5
    areaScores[area.id] = max === 0 ? 0 : (sum / max) * 100
  }
  return areaScores
}

export function calculateOverallScore(areaScores) {
  const values = Object.values(areaScores)
  if (!values.length) return 0
  return values.reduce((sum, score) => sum + score, 0) / values.length
}
