import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import Login from '@/views/auth/Login.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(Login)
    expect(wrapper.text()).toContain('Sign in')
  })
})
