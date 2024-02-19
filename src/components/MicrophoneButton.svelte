<script lang="ts">
    import { Loading } from 'carbon-components-svelte';
    import MicrophoneIcon from './icons/MicrophoneIcon.svelte';

    export let disabled;
    export let isLoading;
    export let isListening;
</script>

<button on:click class='microphone-button' disabled={disabled || isLoading} class:recording={isListening} title="Speak to ask">
    {#if isLoading}
        <Loading withOverlay={false} small />
    {:else}
        <MicrophoneIcon/>
    {/if}
</button>

<style>
    .microphone-button {
        all: unset;
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background-color: transparent;
    }

    .microphone-button::before {
        content: '';
        position: absolute;
        width: 48px;
        height: 48px;
        background-color: #0f62fe;
        border-radius: 50%;
        z-index: 0;
    }

    .microphone-button:hover::before {
        background-color: #0353e9;
    }

    .microphone-button.recording::before {
        background-color: red;
        animation: pulseAnimation 0.8s ease-in-out infinite alternate;
    }

    .microphone-button.recording::after {
        content: '';
        position: absolute;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        z-index: 0;
        pointer-events: none;
        background-color: rgba(255, 0, 0, 0.349);
        animation: pulse2Animation 0.8s 0.8s ease-in infinite alternate;
    }

    .microphone-button:disabled::before {
        background-color: #e0e0e0;
    }

    .microphone-button:disabled {
        pointer-events: none;
    }

    @keyframes pulseAnimation {
        0% {
            transform: scale(1);
        }
        100% {
            transform: scale(0.8);
        }
    }

    @keyframes pulse2Animation {
        0% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(0.5);
        }
    }
</style>