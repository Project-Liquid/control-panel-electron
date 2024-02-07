import './index.css';
import './app';
import { UdpIPC } from './utility/udpIPC';

declare global {
    interface Window {
        udp: UdpIPC
    }
}
