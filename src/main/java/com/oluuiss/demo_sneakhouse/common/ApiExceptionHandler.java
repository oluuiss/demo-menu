package com.oluuiss.demo_sneakhouse.common;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Turns errors into { code, message, fields? } JSON. Messages are localized using the request's
 * Accept-Language header (pt-BR, en or de).
 */
@RestControllerAdvice
public class ApiExceptionHandler {

	private final MessageSource messages;

	public ApiExceptionHandler(MessageSource messages) {
		this.messages = messages;
	}

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<Map<String, Object>> handleApi(ApiException ex) {
		return ResponseEntity.status(ex.getStatus()).body(body(ex.getCode(), ex.getArgs()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
		Map<String, String> fields = new LinkedHashMap<>();
		ex.getBindingResult().getFieldErrors()
				.forEach(error -> fields.putIfAbsent(error.getField(), error.getDefaultMessage()));
		Map<String, Object> body = body("error.validation");
		body.put("fields", fields);
		return ResponseEntity.badRequest().body(body);
	}

	@ExceptionHandler({ HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class })
	public ResponseEntity<Map<String, Object>> handleUnreadable(Exception ex) {
		return ResponseEntity.badRequest().body(body("error.badRequest"));
	}

	private Map<String, Object> body(String code, Object... args) {
		Locale locale = LocaleContextHolder.getLocale();
		Map<String, Object> body = new LinkedHashMap<>();
		body.put("code", code);
		body.put("message", messages.getMessage(code, args, code, locale));
		return body;
	}

}
