import { OperationHandlerSetup } from '@trayio/cdk-dsl/connector/operation/OperationHandlerSetup';
import { PineconeAuth } from '../PineconeAuth';
import { UpsertVectorsInput } from './input';
import { UpsertVectorsOutput } from './output';
import { globalConfigHttp } from '../GlobalConfig';
import { OperationHandlerResult, OperationHandlerError } from '@trayio/cdk-dsl/connector/operation/OperationHandler';

export const upsertVectorsHandler = OperationHandlerSetup.configureHandler<
	PineconeAuth,
	UpsertVectorsInput,
	UpsertVectorsOutput
>((handler) =>
	handler.withGlobalConfiguration(globalConfigHttp).usingHttp((http) =>
		http
			.post('/vectors/upsert')
			.handleRequest((ctx, input, request) => {
				let req = request.addQueryString('index_host', input.index_host);
				if (input.namespace) {
					req = req.addQueryString('namespace', input.namespace);
				}
				return req.withBodyAsJson({ vectors: input.vectors });
			})
			.handleResponse((ctx, input, response) =>
				response
					.withErrorHandling(() => {
						if (response.getStatusCode() === 400) {
							return OperationHandlerResult.failure(
								OperationHandlerError.userInputError('Bad request')
							);
						}
						return OperationHandlerResult.failure(
							OperationHandlerError.apiError(`API error: ${response.getStatusCode()}`)
						);
					})
					.parseWithBodyAsJson()
			)
	)
);