import { app } from '../../scripts/app'
import { api } from '../../scripts/api'
import { useToastStore } from '@/stores/toastStore'

app.registerExtension({
  name: 'Comfy.Keybinds',
  init() {
    const keybindListener = async function (event) {
      const modifierPressed = event.ctrlKey || event.metaKey

      // Queue prompt using (ctrl or command) + enter
      if (modifierPressed && event.key === 'Enter') {
        // Cancel current prompt using (ctrl or command) + alt + enter
        if (event.altKey) {
          await api.interrupt()
          useToastStore().add({
            severity: 'info',
            summary: 'Interrupted',
            detail: 'Execution has been interrupted',
            life: 1000
          })
          return
        }
        // Queue prompt as first for generation using (ctrl or command) + shift + enter
        app.queuePrompt(event.shiftKey ? -1 : 0).then()
        return
      }

      const target = event.composedPath()[0]
      if (
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'INPUT' ||
        (target.tagName === 'SPAN' &&
          target.classList.contains('property_value'))
      ) {
        return
      }

      const modifierKeyIdMap = {
        s: '#comfy-save-button',
        o: '#comfy-file-input',
        Backspace: '#comfy-clear-button',
        d: '#comfy-load-default-button',
        g: '#comfy-group-selected-nodes-button',
        ',': '.comfy-settings-btn'
      }

      const modifierKeybindId = modifierKeyIdMap[event.key]
      if (modifierPressed && modifierKeybindId) {
        event.preventDefault()

        const elem = document.querySelector(modifierKeybindId)
        elem.click()
        return
      }

      // Finished Handling all modifier keybinds, now handle the rest
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      // Close out of modals using escape
      if (event.key === 'Escape') {
        const modals = document.querySelectorAll<HTMLElement>('.comfy-modal')
        const modal = Array.from(modals).find(
          (modal) =>
            window.getComputedStyle(modal).getPropertyValue('display') !==
            'none'
        )
        if (modal) {
          modal.style.display = 'none'
        }

        ;[...document.querySelectorAll('dialog')].forEach((d) => {
          d.close()
        })
      }

      const keyIdMap = {
        q: '.queue-tab-button.side-bar-button',
        h: '.queue-tab-button.side-bar-button',
        r: '#comfy-refresh-button'
      }

      const buttonId = keyIdMap[event.key]
      if (buttonId) {
        const button = document.querySelector(buttonId)
        button.click()
      }
    }

    window.addEventListener('keydown', keybindListener, true)
  }
})
