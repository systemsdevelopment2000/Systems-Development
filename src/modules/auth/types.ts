export interface Credentials {
  email: string
  password: string
}

export interface SignUpData extends Credentials {
  nombre: string
  cargo?: string
}

