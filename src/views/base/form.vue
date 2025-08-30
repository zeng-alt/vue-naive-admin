<template>
  <CommonPage>
    <Vueform
      :locale="i18n"
      size="lg"
      :display-errors="false"
    >
      <StaticElement
        name="register_title"
        content="Create account"
        tag="h1"
      />
      <StaticElement
        name="divider"
        tag="hr"
      />
      <StaticElement
        name="register_title"
        content="Create account"
        tag="h1"
      />
      <StaticElement
        name="divider"
        tag="hr"
      />
      <StaticElement
        name="register_title"
        content="Create account"
        tag="h1"
      />
      <StaticElement
        name="divider"
        tag="hr"
      />
      <GroupElement
        name="container"
        description="Make sure it matches your legal name"
      >
        <TextElement
          name="first_name"
          placeholder="First name"
          :columns="{
            container: 6,
            label: 12,
            wrapper: 12,
          }"
          field-name="First name"
          :rules="[
            'required',
            'max:255',
          ]"
        />
        <TextElement
          name="last_name"
          placeholder="Last name"
          :columns="{
            container: 6,
            label: 12,
            wrapper: 12,
          }"
          field-name="Last name"
          :rules="[
            'required',
            'max:255',
          ]"
        />
      </GroupElement>
      <DateElement
        name="birthday"
        placeholder="Birthday"
        field-name="Birthday"
        :rules="[
          'required',
        ]"
        description="Your birthday is not visible others."
        display-format="MMMM Do, YYYY"
      />
      <SelectElement
        name="country"
        :search="true"
        :native="false"
        input-type="search"
        autocomplete="disabled"
        placeholder="Country"
        items="/json/countries.json"
      />
      <SelectElement
        name="state"
        :search="true"
        :native="false"
        input-type="search"
        autocomplete="disabled"
        placeholder="State"
        items="/json/states.json"
        :conditions="[
          [
            'country',
            'in',
            [
              'US',
            ],
          ],
        ]"
      />
      <PhoneElement
        name="phone"
        placeholder="Phone"
        :rules="[
          'required',
        ]"
        field-name="Phone"
        :allow-incomplete="true"
        :unmask="true"
      />
      <TextElement
        name="email"
        input-type="email"
        :rules="[
          'required',
          'max:255',
          'email',
        ]"
        placeholder="Email"
        field-name="Email"
        description="You will receive a confirmation letter to this email."
      />
      <TextElement
        name="password"
        input-type="password"
        :rules="[
          'required',
          'min:8',
          'same:password_confirmation',
        ]"
        field-name="Password"
        placeholder="Password"
      />
      <TextElement
        name="password_confirmation"
        input-type="password"
        :rules="[
          'required',
        ]"
        field-name="Password confirmation"
        placeholder="Password again"
      />
      <CheckboxElement
        name="terms"
        text="I accept the Terms & Conditions & Privacy Policy"
      />
      <CheckboxElement
        name="marketing_emails"
        text="I want to recieve marketing emails"
      />
      <StaticElement
        name="divider_1"
        tag="hr"
      />
      <ButtonElement
        name="register"
        :submits="true"
        button-label="Create account"
        :full="true"
        size="sm"
      />
    </Vueform>
  </CommonPage>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { locale } = useI18n()

const i18n = computed(() => {
  return locale.value
})
</script>