import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { EmailService } from '@growchief/shared-backend/email/email.service';
import { CreateOrgUserDto } from '@growchief/shared-both/dto/auth/create.org.user.dto';
import { AuthService } from '@growchief/backend/services/auth/auth.service';
import { LoginUserDto } from '@growchief/shared-both/dto/auth/login.user.dto';
import { ForgotPasswordDto } from '@growchief/shared-both/dto/auth/forgot.password.dto';
import { ForgotReturnPasswordDto } from '@growchief/shared-both/dto/auth/forgot-return.password.dto';
import { getUrlFromDomain } from '@growchief/shared-both/utils/get.url.from.domain';

@Controller('/auth')
export class AuthController {
  constructor(
    private _authService: AuthService,
    private _emailService: EmailService,
  ) {}

  @Get('/register-information')
  async canRegister() {
    const onboarding = await this._authService.isSuperAdminOnboarding();
    return {
      isSuperAdminOnboarding: onboarding,
      canRegister: (await this._authService.canRegister()) || onboarding,
    };
  }

  @Post('/register')
  async register(
    @Req() req: Request,
    @Body() body: CreateOrgUserDto,
    @Res({ passthrough: false }) response: Response,
  ) {
    try {
      const getOrgFromCookie = this._authService.getOrgFromCookie(
        req?.cookies?.org,
      );

      const { jwt } = await this._authService.routeAuth(
        body.provider,
        body,
        body.website,
        getOrgFromCookie,
      );

      const activationRequired =
        body.provider === 'LOCAL' && this._emailService.hasProvider();

      if (activationRequired) {
        response.header('activate', 'true');
        response.status(200).json({ activate: true });
        return;
      }

      response.cookie('auth', jwt, {
        domain: getUrlFromDomain(process.env.FRONTEND_URL!),
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      });

      response.header('onboarding', 'true');
      response.header('logged', 'true');
      response.status(200).json({
        register: true,
      });
    } catch (e: any) {
      response.status(400).send(e.message);
    }
  }

  @Post('/login')
  async login(
    @Req() req: Request,
    @Body() body: LoginUserDto,
    @Res({ passthrough: false }) response: Response,
  ) {
    try {
      const getOrgFromCookie = this._authService.getOrgFromCookie(
        req?.cookies?.org,
      );

      const { jwt, addedOrg } = await this._authService.routeAuth(
        body.provider,
        body,
        body.website,
        getOrgFromCookie,
      );

      response.cookie('auth', jwt, {
        domain: getUrlFromDomain(process.env.FRONTEND_URL!),
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      });

      response.header('logged', 'true');
      response.status(200).json({
        login: true,
      });
    } catch (e: any) {
      response.status(400).send(e.message);
    }
  }

  @Post('/forgot')
  async forgot(@Body() body: ForgotPasswordDto) {
    try {
      await this._authService.forgot(body.email);
      return {
        forgot: true,
      };
    } catch (e) {
      return {
        forgot: false,
      };
    }
  }

  @Post('/forgot-return')
  async forgotReturn(@Body() body: ForgotReturnPasswordDto) {
    const reset = await this._authService.forgotReturn(body);
    return {
      reset: !!reset,
    };
  }

  @Get('/oauth/:provider')
  async oauthLink(@Param('provider') provider: string, @Query() query: any) {
    return this._authService.oauthLink(provider, query.website, query);
  }

  @Post('/activate')
  async activate(
    @Body('code') code: string,
    @Res({ passthrough: false }) response: Response,
  ) {
    const activate = await this._authService.activate(code);
    if (!activate) {
      return response.status(200).send({ can: false });
    }

    response.cookie('auth', activate, {
      domain: getUrlFromDomain(process.env.FRONTEND_URL!),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });

    response.header('onboarding', 'true');
    response.header('logged', 'true');
    return response.status(200).send({ can: true });
  }

  @Post('/oauth/:provider/exists')
  async oauthExists(
    @Body('code') code: string,
    @Body('website') website: string,
    @Param('provider') provider: string,
    @Res({ passthrough: false }) response: Response,
  ) {
    const { jwt, token } = await this._authService.checkExists(
      provider,
      code,
      website,
    );
    if (token) {
      return response.json({ token });
    }

    response.cookie('auth', jwt, {
      domain: getUrlFromDomain(process.env.FRONTEND_URL!),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });

    response.header('reload', 'true');
    response.header('logged', 'true');

    response.status(200).json({
      login: true,
    });
  }
}
