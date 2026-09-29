package com.oluuiss.demo_sneakhouse.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

public class AuthenticatedUserArgumentResolver implements HandlerMethodArgumentResolver {

	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		return AuthenticatedUser.class.equals(parameter.getParameterType());
	}

	@Override
	public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
			NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
		HttpServletRequest request = webRequest.getNativeRequest(HttpServletRequest.class);
		HttpSession session = request == null ? null : request.getSession(false);
		Object userId = session == null ? null : session.getAttribute(AuthenticatedUser.SESSION_ATTRIBUTE);
		if (userId instanceof Long id) {
			return new AuthenticatedUser(id);
		}
		throw new ApiException(HttpStatus.UNAUTHORIZED, "auth.required");
	}

}
