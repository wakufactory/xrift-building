import { DevEnvironment, XRiftProvider } from '@xrift/world-components'
import type { CameraConfig, PhysicsConfig } from '@xrift/world-components'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { World } from './World'
import xriftConfig from '../xrift.json'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

const physicsConfig: PhysicsConfig | undefined = (
  xriftConfig as { world?: { physics?: PhysicsConfig } }
).world?.physics

const cameraConfig: CameraConfig | undefined = (
  xriftConfig as { world?: { camera?: CameraConfig } }
).world?.camera

createRoot(rootElement).render(
  <StrictMode>
    <XRiftProvider baseUrl="/">
      <DevEnvironment physicsConfig={physicsConfig} camera={cameraConfig}>
        <World />
      </DevEnvironment>
    </XRiftProvider>
  </StrictMode>,
)
