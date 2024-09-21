import { IsEnum, IsNotEmpty, IsNumberString, IsString, validateOrReject } from 'class-validator'

export class Config {
    @IsEnum(['development', 'production', 'test'])
    NODE_ENV: string

    @IsNumberString()
    @IsNotEmpty()
    PORT: string

    @IsString()
    @IsNotEmpty()
    DB_URL: string

    constructor(NODE_ENV: string, PORT: string, DB_URL: string) {
        this.NODE_ENV = NODE_ENV ?? 'development'
        this.PORT = PORT ?? '3004'
        this.DB_URL = DB_URL
    }

    static fromEnv(env: { [key: string]: string | undefined }): Config {
        return new Config(env.NODE_ENV!, env.PORT!, env.DB_URL!)
    }

    async validateOrReject(): Promise<void> {
        await validateOrReject(this)
    }
}
