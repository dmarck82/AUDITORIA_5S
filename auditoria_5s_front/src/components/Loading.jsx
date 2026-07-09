import { LoadingOverlay } from './ui'

function Loading({ message = 'Carregando...' }) {
  return <LoadingOverlay inline message={message} />
}

export default Loading
