const User = require("../../models/User");
const Domain = require("../../models/Domain");
const BadRequestError = require("../../errors/BadRequestError");
const NotFoundError = require("../../errors/NotFoundError");
const domainProviderApiClient = require("../../utils/domainProviderApiClient");
const {
	createClientOnBothProviders,
	createDomainProviderClient,
} = require("../../services/domainProviderClient");
const apiClient = require("../../utils/apiclient");

class DomainContactController {
	// Get all contacts of a specific type for a domain
	static async getAll(req, res) {
		const { domainName } = req.params;
		const { contactType = "technical" } = req.query; // Default to technical for backward compatibility
		const domain = await Domain.findOne({ websiteName: domainName });
		if (!domain) throw new NotFoundError("Domain not found");
		const provider = domain.provider;
		const user = await User.findById(req.user.id);
		if (!user) throw new NotFoundError("User not found");

		try {
			const domainDetails = await domainProviderApiClient.request(
				"ViewDomain",
				{ websiteName: domainName },
				null,
				provider
			);
			console.log(
				"Domain details response:",
				JSON.stringify(domainDetails, null, 2)
			);

			// 2. Extract contact handles/IDs
			let contactHandles = {};
			if (provider === "openprovider") {
				contactHandles = {
					registrant:
						domainDetails?.responseData?.owner_handle ||
						domainDetails?.responseData?.admin_handle,
					technical: domainDetails?.responseData?.tech_handle,
					admin: domainDetails?.responseData?.admin_handle,
					billing: domainDetails?.responseData?.billing_handle,
				};
			} else if (provider === "connectreseller") {
				contactHandles = {
					registrant:
						domainDetails?.responseData?.registrantContactId,
					technical: domainDetails?.responseData?.technicalContactId,
					admin: domainDetails?.responseData?.adminContactId,
					billing: domainDetails?.responseData?.billingContactId,
				};
			}

			console.log("Extracted contact handles:", contactHandles);
			console.log("Contact type:", contactType);
			// If specific contact type is requested, only return that type
			if (contactType && contactType.toLowerCase() !== "all") {
				const contactTypeKey = contactType.toLowerCase();
				const handle = contactHandles[contactTypeKey];
				console.log("Handle:", handle);
				if (!handle) {
					return res.json({
						domain: domainName,
						provider,
						contacts: {
							[contactTypeKey]: null,
						},
					});
				}

				try {
					const contactDetails =
						await domainProviderApiClient.request(
							provider === "openprovider"
								? "GetCustomerDetails"
								: "ViewRegistrant",
							{
								...(provider === "openprovider"
									? { handle }
									: {
											contactId: handle,
									  }),
							},
							"get",
							provider
						);

					console.log("Contact details:", contactDetails);
					let normalizedContact = null;
					if (contactDetails?.responseData) {
						normalizedContact =
							provider === "openprovider"
								? {
										handle: contactDetails?.responseData
											?.handle,
										name: {
											first_name:
												contactDetails?.responseData
													?.name?.first_name,
											last_name:
												contactDetails?.responseData
													?.name?.last_name,
											full_name:
												contactDetails?.responseData
													?.name?.full_name,
										},
										email: contactDetails?.responseData
											?.email,
										phone: {
											country_code:
												contactDetails?.responseData
													?.phone?.country_code,
											subscriber_number:
												contactDetails?.responseData
													?.phone?.subscriber_number,
										},
										address: {
											street: contactDetails?.responseData
												?.address?.street,
											city: contactDetails?.responseData
												?.address?.city,
											state: contactDetails?.responseData
												?.address?.state,
											country:
												contactDetails?.responseData
													?.address?.country,
											zipcode:
												contactDetails?.responseData
													?.address?.zipcode,
										},
										company_name:
											contactDetails?.responseData
												?.company_name,
										fax: contactDetails?.responseData?.fax,
										tags: contactDetails?.responseData
											?.tags,
								  }
								: {
										handle:
											contactDetails?.responseData
												?.ContactId ||
											contactDetails?.responseData
												?.clientId,
										name: {
											first_name:
												contactDetails?.responseData?.Name?.split(
													" "
												)[0] ||
												contactDetails?.responseData
													?.FirstName,
											last_name:
												contactDetails?.responseData?.Name?.split(
													" "
												)
													.slice(1)
													.join(" ") ||
												contactDetails?.responseData
													?.LastName,
											full_name:
												contactDetails?.responseData
													?.Name ||
												`${contactDetails?.responseData?.FirstName} ${contactDetails?.responseData?.LastName}`,
										},
										email:
											contactDetails?.responseData
												?.emailaddress ||
											contactDetails?.responseData
												?.EmailAddress,
										phone: {
											country_code:
												contactDetails?.responseData
													?.phoneNo_cc || "+1",
											subscriber_number:
												contactDetails?.responseData
													?.phoneNo ||
												contactDetails?.responseData
													?.PhoneNo,
										},
										address: {
											street:
												contactDetails?.responseData
													?.address ||
												contactDetails?.responseData
													?.Address,
											city:
												contactDetails?.responseData
													?.city ||
												contactDetails?.responseData
													?.City,
											state:
												contactDetails?.responseData
													?.stateName ||
												contactDetails?.responseData
													?.StateName,
											country:
												contactDetails?.responseData
													?.countryName ||
												contactDetails?.responseData
													?.CountryCode,
											zipcode:
												contactDetails?.responseData
													?.zip ||
												contactDetails?.responseData
													?.ZipCode,
										},
										company_name:
											contactDetails?.responseData
												?.companyName ||
											contactDetails?.responseData
												?.CompanyName,
										fax:
											contactDetails?.responseData
												?.faxNo ||
											contactDetails?.responseData?.FaxNo
												? {
														country_code:
															contactDetails
																?.responseData
																?.faxNo_cc ||
															"+1",
														subscriber_number:
															contactDetails
																?.responseData
																?.faxNo ||
															contactDetails
																?.responseData
																?.FaxNo,
												  }
												: null,
								  };
					}
					console.log("Normalized contact:", normalizedContact);

					return res.json({
						domain: domainName,
						provider,
						contacts: {
							[contactTypeKey]: normalizedContact,
						},
					});
				} catch (error) {
					console.error(
						`Error fetching ${contactType} contact details:`,
						error
					);
					return res.json({
						domain: domainName,
						provider,
						contacts: {
							[contactTypeKey]: null,
						},
						error: `Failed to fetch ${contactType} contact details`,
					});
				}
			}

			// 3. Fetch complete contact details for each handle/ID if all contacts are requested
			const contacts = {};
			for (const [role, handle] of Object.entries(contactHandles)) {
				if (handle) {
					try {
						const contactDetails =
							await domainProviderApiClient.request(
								provider === "openprovider"
									? "GetCustomerDetails"
									: "ViewRegistrant",
								{
									...(provider === "openprovider"
										? { handle }
										: {
												contactId: handle,
										  }),
								},
								"get",
								provider
							);

						console.log(
							`Contact details for ${role}:`,
							JSON.stringify(contactDetails, null, 2)
						);

						let normalizedContact = null;
						// Use the same normalization logic for consistency
						if (contactDetails?.responseData) {
							normalizedContact =
								provider === "openprovider"
									? {
											handle: contactDetails?.responseData
												?.handle,
											name: {
												first_name:
													contactDetails?.responseData
														?.name?.first_name,
												last_name:
													contactDetails?.responseData
														?.name?.last_name,
												full_name:
													contactDetails?.responseData
														?.name?.full_name,
											},
											email: contactDetails?.responseData
												?.email,
											phone: {
												country_code:
													contactDetails?.responseData
														?.phone?.country_code,
												subscriber_number:
													contactDetails?.responseData
														?.phone
														?.subscriber_number,
											},
											address: {
												street: contactDetails
													?.responseData?.address
													?.street,
												city: contactDetails
													?.responseData?.address
													?.city,
												state: contactDetails
													?.responseData?.address
													?.state,
												country:
													contactDetails?.responseData
														?.address?.country,
												zipcode:
													contactDetails?.responseData
														?.address?.zipcode,
											},
											company_name:
												contactDetails?.responseData
													?.company_name,
											fax: contactDetails?.responseData
												?.fax,
											tags: contactDetails?.responseData
												?.tags,
									  }
									: {
											handle:
												contactDetails?.responseData
													?.ContactId ||
												contactDetails?.responseData
													?.clientId,
											name: {
												first_name:
													contactDetails?.responseData?.Name?.split(
														" "
													)[0] ||
													contactDetails?.responseData
														?.FirstName,
												last_name:
													contactDetails?.responseData?.Name?.split(
														" "
													)
														.slice(1)
														.join(" ") ||
													contactDetails?.responseData
														?.LastName,
												full_name:
													contactDetails?.responseData
														?.Name ||
													`${contactDetails?.responseData?.FirstName} ${contactDetails?.responseData?.LastName}`,
											},
											email:
												contactDetails?.responseData
													?.emailaddress ||
												contactDetails?.responseData
													?.EmailAddress,
											phone: {
												country_code:
													contactDetails?.responseData
														?.phoneNo_cc || "+1",
												subscriber_number:
													contactDetails?.responseData
														?.phoneNo ||
													contactDetails?.responseData
														?.PhoneNo,
											},
											address: {
												street:
													contactDetails?.responseData
														?.address ||
													contactDetails?.responseData
														?.Address,
												city:
													contactDetails?.responseData
														?.city ||
													contactDetails?.responseData
														?.City,
												state:
													contactDetails?.responseData
														?.stateName ||
													contactDetails?.responseData
														?.StateName,
												country:
													contactDetails?.responseData
														?.countryName ||
													contactDetails?.responseData
														?.CountryCode,
												zipcode:
													contactDetails?.responseData
														?.zip ||
													contactDetails?.responseData
														?.ZipCode,
											},
											company_name:
												contactDetails?.responseData
													?.companyName ||
												contactDetails?.responseData
													?.CompanyName,
											fax:
												contactDetails?.responseData
													?.faxNo ||
												contactDetails?.responseData
													?.FaxNo
													? {
															country_code:
																contactDetails
																	?.responseData
																	?.faxNo_cc ||
																"+1",
															subscriber_number:
																contactDetails
																	?.responseData
																	?.faxNo ||
																contactDetails
																	?.responseData
																	?.FaxNo,
													  }
													: null,
									  };
						}
						console.log(
							`Normalized contact for ${role}:`,
							JSON.stringify(normalizedContact, null, 2)
						);
						contacts[role] = normalizedContact;
					} catch (error) {
						console.error(
							`Error fetching ${role} contact details:`,
							error
						);
						contacts[role] = {
							handle,
							error: "Failed to fetch details",
						};
					}
				}
			}

			return res.json({
				domain: domainName,
				provider,
				contacts,
			});
		} catch (error) {
			console.error("Error fetching domain contacts:", error);
			throw new BadRequestError("Failed to fetch domain contacts");
		}
	}

	// Add a contact to a domain
	static async add(req, res) {
		const { domainName } = req.params;
		const { contactType = "technical" } = req.query; // Default to technical for backward compatibility
		const domain = await Domain.findOne({ websiteName: domainName });
		if (!domain) throw new NotFoundError("Domain not found");
		const provider = domain.provider;
		const user = await User.findById(req.user.id);
		if (!user) throw new NotFoundError("User not found");
		const contactData = req.body;

		if (
			!contactData.firstName ||
			!contactData.lastName ||
			!contactData.email
		) {
			return res.status(400).json({
				error: "Missing required fields",
				message: "firstName, lastName, and email are required",
				received: {
					firstName: contactData.firstName,
					lastName: contactData.lastName,
					email: contactData.email,
					fullBody: req.body,
				},
				provider,
			});
		}

		let contactHandleOrId;
		let contactResponse;

		try {
			if (provider === "openprovider") {
				// 1. Create contact customer using proper OpenProvider structure
				contactResponse = await domainProviderApiClient.request(
					"AddCustomer",
					{
						firstName: contactData.firstName,
						lastName: contactData.lastName,
						initials: contactData.initials,
						prefix: contactData.prefix,
						email: contactData.email,
						address: contactData.address,
						addressNumber: contactData.addressNumber,
						city: contactData.city,
						zip: contactData.zip,
						country: contactData.country,
						state: contactData.state,
						phoneCountryCode: contactData.phoneCountryCode,
						phoneAreaCode: contactData.phoneAreaCode,
						phone: contactData.phone,
						companyName: contactData.companyName,
						fax: contactData.fax,
						faxCountryCode: contactData.faxCountryCode,
						faxAreaCode: contactData.faxAreaCode,
						tags: contactData.tags,
					},
					"post",
					provider
				);

				console.log("contactResponse =======>", contactResponse);
				if (!contactResponse?.responseData?.handle) {
					throw new BadRequestError(
						"Failed to add contact. Please try again."
					);
				}

				contactHandleOrId = contactResponse.responseData.handle;

				// 2. Update domain with new handle
				const contacts = {};

				console.log("registrant =======>", contactType.toLowerCase());
				// Set only the specific contact type we want to modify
				switch (contactType.toLowerCase()) {
					case "registrant":
						contacts.admin_handle = contactHandleOrId;
						break;
					case "admin":
						contacts.admin_handle = contactHandleOrId;
						break;
					case "billing":
						contacts.billing_handle = contactHandleOrId;
						break;
					case "technical":
					default:
						contacts.tech_handle = contactHandleOrId;
						break;
				}

				const domainDetails = await domainProviderApiClient.request(
					"ViewDomain",
					{ websiteName: domainName },
					null,
					provider
				);

				const { websiteId } = domainDetails?.responseData;
				if (!websiteId) {
					throw new BadRequestError(
						"Could not get domain ID for contact update"
					);
				}

				console.log("contacts =======>", contacts);
				const updateRes = await domainProviderApiClient.request(
					"ModifyDomainContacts",
					{
						domainId: websiteId,
						contacts: contacts,
					},
					"put",
					provider
				);
				console.log("updateRes =======>", updateRes);
				if (updateRes?.responseMsg?.statusCode !== 200) {
					throw new BadRequestError(
						"Failed to add contact. Please try again."
					);
				}
			} else if (provider === "connectreseller") {
				// Get client ID (create client if needed)
				let clientId =
					user?.domainProviderClient?.connectreseller?.clientId;
				if (!clientId) {
					// Generate a random password for the client
					const generateRandomPassword = () => {
						const chars =
							"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
						let password = "";
						for (let i = 0; i < 12; i++) {
							password += chars.charAt(
								Math.floor(Math.random() * chars.length)
							);
						}
						return password;
					};

					const clientParams = {
						FirstName: contactData.firstName,
						LastName: contactData.lastName,
						UserName: contactData.email,
						Password: generateRandomPassword(),
						CompanyName: contactData.companyName || "",
						Address1: contactData.address,
						City: contactData.city,
						StateName: contactData.state || "",
						CountryName: contactData.country,
						Zip: contactData.zip,
						PhoneNo_cc: contactData.phoneCountryCode || "+1",
						PhoneNo: contactData.phone,
						Faxno_cc: contactData.faxCountryCode || "",
						FaxNo: contactData.fax || "",
						Alternate_Phone_cc: "",
						Alternate_Phone: "",
						Id: user.id.toString(),
					};

					contactResponse = await domainProviderApiClient.request(
						"AddClient",
						clientParams,
						null,
						provider
					);

					clientId =
						contactResponse?.responseData?.clientId ||
						contactResponse?.clientId;

					if (!user.domainProviderClient) {
						user.domainProviderClient = {};
					}
					user.domainProviderClient.connectreseller = {
						clientId,
						username: user.email,
					};
					await user.save();
				}

				if (!clientId) {
					throw new Error(
						"Failed to create client - no client ID returned"
					);
				}

				// 1. Create registrant contact using the official API
				const contactParams = {
					firstName: contactData.firstName,
					lastName: contactData.lastName,
					email: contactData.email,
					companyName: contactData.companyName || "",
					address: contactData.address,
					city: contactData.city,
					state: contactData.state || "",
					country: contactData.country,
					zip: contactData.zip,
					phoneCountryCode: contactData.phoneCountryCode || "+1",
					phone: contactData.phone,
					faxCountryCode: contactData.faxCountryCode || "",
					fax: contactData.fax || "",
					alternatePhoneCountryCode: "",
					alternatePhone: "",
					clientId: clientId,
				};

				console.log(
					"Creating registrant contact with params:",
					JSON.stringify(contactParams, null, 2)
				);

				// Create registrant contact
				const contactCreateResponse =
					await domainProviderApiClient.request(
						"AddRegistrantContact",
						contactParams,
						null,
						provider
					);

				console.log(
					"AddRegistrantContact response:",
					JSON.stringify(contactCreateResponse, null, 2)
				);

				if (contactCreateResponse?.responseMsg?.statusCode !== 200) {
					throw new Error(
						`Failed to create contact: ${
							contactCreateResponse?.responseMsg?.message ||
							"Unknown error"
						}`
					);
				}

				// Extract contact ID from response - need to check the actual response structure
				const newContactId =
					contactCreateResponse?.responseData?.contactId?.toString() ||
					contactCreateResponse?.responseData?.RegistrantContactId?.toString() ||
					contactCreateResponse?.responseMsg?.id?.toString();

				if (!newContactId) {
					throw new Error("Failed to get contact ID from response");
				}

				// Wait a moment for the contact to be fully processed
				await new Promise((resolve) => setTimeout(resolve, 2000));

				const contactDetails = await domainProviderApiClient.request(
					"ViewRegistrant",
					{
						contactId: newContactId,
					},
					"get",
					provider
				);

				console.log(
					"Contact details:=====================================>",
					contactDetails
				);

				// 2. Get current domain details to get domainNameId and preserve other contacts
				const domainDetails = await domainProviderApiClient.request(
					"ViewDomain",
					{ websiteName: domainName },
					null,
					provider
				);

				const domainNameId = domainDetails?.responseData?.domainNameId;
				if (!domainNameId) {
					throw new Error(
						"Could not get domainNameId from domain details"
					);
				}

				// 3. Assign the new contact to the domain using official updatecontact endpoint
				const updateContactParams = {
					domainNameId: domainNameId,
					websiteName: domainName,
					adminContactId: domainDetails?.responseData?.adminContactId,
					billingContactId:
						domainDetails?.responseData?.billingContactId,
					registrantContactId:
						domainDetails?.responseData?.registrantContactId,
					technicalContactId:
						domainDetails?.responseData?.technicalContactId,
				};

				// Update the specific contact type
				switch (contactType.toLowerCase()) {
					case "registrant":
						updateContactParams.registrantContactId = newContactId;
						break;
					case "admin":
						updateContactParams.adminContactId = newContactId;
						break;
					case "billing":
						updateContactParams.billingContactId = newContactId;
						break;
					case "technical":
					default:
						updateContactParams.technicalContactId = newContactId;
				}

				console.log(
					"Updating domain contacts with params:",
					JSON.stringify(updateContactParams, null, 2)
				);

				const assignmentResponse =
					await domainProviderApiClient.request(
						"ModifyDomainContact",
						updateContactParams,
						null,
						provider
					);

				console.log(
					"ModifyDomainContact response:",
					JSON.stringify(assignmentResponse, null, 2)
				);

				if (assignmentResponse?.responseMsg?.statusCode !== 200) {
					throw new Error(
						`Failed to assign contact to domain: ${
							assignmentResponse?.responseMsg?.message ||
							"Unknown error"
						}`
					);
				}

				// Format response to match OpenProvider structure
				return res.status(200).json({
					success: true,
					message: `${contactType} contact created and assigned successfully`,
					data: {
						contactId: newContactId,
						contactType: contactType,
						contactData: {
							firstName: contactData.firstName,
							lastName: contactData.lastName,
							email: contactData.email,
							phone: contactData.phone,
							address: contactData.address,
							city: contactData.city,
							state: contactData.state,
							country: contactData.country,
							zip: contactData.zip,
						},
					},
					provider: "connectreseller",
				});
			}
		} catch (error) {
			console.error(`Error adding ${contactType} contact:`, error);
			throw new BadRequestError(`Failed to add ${contactType} contact`);
		}
	}

	// Update a contact
	static async update(req, res) {
		const { domainName, contactId } = req.params;
		const { contactType = "technical" } = req.query;
		const domain = await Domain.findOne({ websiteName: domainName });
		if (!domain) throw new NotFoundError("Domain not found");
		const provider = domain.provider;
		const user = await User.findById(req.user.id);
		if (!user) throw new NotFoundError("User not found");
		const contactData = req.body;

		try {
			let updateResponse;

			if (provider === "openprovider") {
				// Update customer using OpenProvider structure
				updateResponse = await domainProviderApiClient.request(
					"UpdateCustomer",
					{
						handle: contactId,
						firstName: contactData.firstName,
						lastName: contactData.lastName,
						initials: contactData.initials,
						prefix: contactData.prefix,
						email: contactData.email,
						address: contactData.address,
						addressNumber: contactData.addressNumber,
						city: contactData.city,
						zip: contactData.zip,
						country: contactData.country,
						state: contactData.state,
						phoneCountryCode: contactData.phoneCountryCode,
						phoneAreaCode: contactData.phoneAreaCode,
						phone: contactData.phone,
						companyName: contactData.companyName,
						fax: contactData.fax,
						faxCountryCode: contactData.faxCountryCode,
						faxAreaCode: contactData.faxAreaCode,
						tags: contactData.tags,
					},
					"put",
					provider
				);
			} else if (provider === "connectreseller") {
				// Update contact using official ModifyRegistrantContact endpoint
				updateResponse = await domainProviderApiClient.request(
					"ModifyRegistrantContact",
					{
						firstName: contactData.firstName,
						lastName: contactData.lastName,
						email: contactData.email,
						companyName: contactData.companyName || "",
						address: contactData.address,
						city: contactData.city,
						state: contactData.state || "",
						country: contactData.country,
						zip: contactData.zip,
						phoneCountryCode: contactData.phoneCountryCode || "+1",
						phone: contactData.phone,
						faxCountryCode: contactData.faxCountryCode || "",
						fax: contactData.fax || "",
						alternatePhoneCountryCode: "",
						alternatePhone: "",
						contactId: contactId,
					},
					null,
					provider
				);

				console.log(
					"ConnectReseller updateResponse =======>",
					updateResponse
				);

				if (updateResponse?.responseMsg?.statusCode !== 200) {
					throw new BadRequestError(
						`Failed to update contact: ${
							updateResponse?.responseMsg?.message ||
							"Unknown error"
						}`
					);
				}
			}

			// Normalize the response
			const normalizedContact =
				provider === "openprovider"
					? {
							handle: updateResponse?.responseData?.handle,
							name: {
								first_name:
									updateResponse?.responseData?.name
										?.first_name,
								last_name:
									updateResponse?.responseData?.name
										?.last_name,
								full_name:
									updateResponse?.responseData?.name
										?.full_name,
							},
							email: updateResponse?.responseData?.email,
							phone: {
								country_code:
									updateResponse?.responseData?.phone
										?.country_code,
								subscriber_number:
									updateResponse?.responseData?.phone
										?.subscriber_number,
							},
							address: {
								street: updateResponse?.responseData?.address
									?.street,
								city: updateResponse?.responseData?.address
									?.city,
								state: updateResponse?.responseData?.address
									?.state,
								country:
									updateResponse?.responseData?.address
										?.country,
								zipcode:
									updateResponse?.responseData?.address
										?.zipcode,
							},
							company_name:
								updateResponse?.responseData?.company_name,
							fax: updateResponse?.responseData?.fax,
							tags: updateResponse?.responseData?.tags,
					  }
					: {
							handle: updateResponse?.responseData?.ContactId,
							name: {
								first_name:
									updateResponse?.responseData?.FirstName,
								last_name:
									updateResponse?.responseData?.LastName,
								full_name: `${updateResponse?.responseData?.FirstName} ${updateResponse?.responseData?.LastName}`,
							},
							email: updateResponse?.responseData?.EmailAddress,
							phone: {
								country_code: "+1",
								subscriber_number:
									updateResponse?.responseData?.PhoneNo,
							},
							address: {
								street: updateResponse?.responseData?.Address,
								city: updateResponse?.responseData?.City,
								state: updateResponse?.responseData?.StateName,
								country:
									updateResponse?.responseData?.CountryCode,
								zipcode: updateResponse?.responseData?.ZipCode,
							},
							company_name:
								updateResponse?.responseData?.CompanyName,
							fax: updateResponse?.responseData?.FaxNo
								? {
										country_code: "+1",
										subscriber_number:
											updateResponse?.responseData?.FaxNo,
								  }
								: null,
					  };

			return res.json({
				message: `${contactType} contact updated successfully`,
				contact: normalizedContact,
				result: {
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: 200,
						message: "Success",
					},
					provider,
				},
			});
		} catch (error) {
			console.error(`Error updating ${contactType} contact:`, error);
			throw new BadRequestError(
				`Failed to update ${contactType} contact`
			);
		}
	}

	// Delete a contact from a domain
	static async remove(req, res) {
		const { domainName, contactId } = req.params;
		const { contactType = "technical" } = req.query; // Default to technical for backward compatibility
		const domain = await Domain.findOne({ websiteName: domainName });
		if (!domain) throw new NotFoundError("Domain not found");
		const provider = domain.provider;
		const user = await User.findById(req.user.id);
		if (!user) throw new NotFoundError("User not found");

		try {
			if (provider === "openprovider") {
				// Get current domain details first to get the owner handle
				const domainDetails = await domainProviderApiClient.request(
					"ViewDomain",
					{ websiteName: domainName },
					null,
					provider
				);

				const { websiteId } = domainDetails?.responseData;
				if (!websiteId) {
					throw new BadRequestError(
						"Could not get domain ID for contact update"
					);
				}

				// Get the owner handle to use as replacement
				const ownerHandle = domainDetails?.responseData?.owner_handle;
				if (!ownerHandle) {
					throw new BadRequestError(
						"Could not find domain owner handle for contact replacement"
					);
				}

				// For OpenProvider, we cannot set contacts to null
				// Instead, we replace the contact with the domain owner
				const contacts = {};
				switch (contactType.toLowerCase()) {
					case "registrant":
						// Cannot remove registrant, it's required
						throw new BadRequestError(
							"Cannot remove registrant contact - it is required for the domain"
						);
					case "admin":
						contacts.admin_handle = ownerHandle;
						break;
					case "technical":
						contacts.tech_handle = ownerHandle;
						break;
					case "billing":
						contacts.billing_handle = ownerHandle;
						break;
				}

				console.log("contacts =======>", contacts);
				const updateRes = await domainProviderApiClient.request(
					"ModifyDomainContacts",
					{
						domainId: websiteId,
						contacts: contacts,
					},
					"put",
					provider
				);

				// Optional: Delete the customer from OpenProvider if requested
				const { deleteCustomer } = req.query;
				if (deleteCustomer === "true" && contactId) {
					try {
						await domainProviderApiClient.request(
							"DeleteCustomer",
							{ handle: contactId },
							"delete",
							provider
						);

						return res.json({
							message: `${contactType} contact replaced with domain owner and customer deleted successfully`,
							result: updateRes,
							note: "Contact was replaced with domain owner and the customer was deleted from OpenProvider",
						});
					} catch (deleteError) {
						console.error("Error deleting customer:", deleteError);
						return res.json({
							message: `${contactType} contact replaced with domain owner successfully, but customer deletion failed`,
							result: updateRes,
							note: "Contact was replaced but customer deletion failed - the customer may be used by other domains",
							deleteError: deleteError.message,
						});
					}
				}

				return res.json({
					message: `${contactType} contact replaced with domain owner successfully`,
					result: updateRes,
					note: "In OpenProvider, contacts cannot be removed - they are replaced with the domain owner contact. Use ?deleteCustomer=true to also delete the customer from OpenProvider.",
				});
			} else if (provider === "connectreseller") {
				// For ConnectReseller, we can actually delete contacts
				// First, get current domain details to preserve other contacts
				const domainDetails = await domainProviderApiClient.request(
					"ViewDomain",
					{
						websiteName: domainName,
						userName: user.username || user.email.split("@")[0],
					},
					null,
					provider
				);

				if (!domainDetails?.responseData) {
					throw new BadRequestError("Could not get domain details");
				}

				// 1. Delete the contact
				const deleteRes = await domainProviderApiClient.request(
					"DeleteContact",
					{
						userName: user.username || user.email.split("@")[0],
						contactId: contactId,
					},
					"post",
					provider
				);

				console.log("ConnectReseller deleteRes =======>", deleteRes);

				if (deleteRes?.responseMsg?.statusCode !== 200) {
					throw new BadRequestError("Failed to delete contact");
				}

				// 2. Update domain to remove the specific contact ID
				// Keep existing contacts for other types, set the specific type to null or default
				const currentDomainData = domainDetails.responseData;
				const updateData = {
					userName: user.username || user.email.split("@")[0],
					domainName: domain.websiteName,
					registrantContactId: currentDomainData.registrantContactId,
					adminContactId: currentDomainData.adminContactId,
					techContactId: currentDomainData.technicalContactId,
					billingContactId: currentDomainData.billingContactId,
				};

				// Set the appropriate contact ID to null based on contact type
				switch (contactType.toLowerCase()) {
					case "registrant":
						// Cannot remove registrant for ConnectReseller either
						throw new BadRequestError(
							"Cannot remove registrant contact - it is required for the domain"
						);
					case "admin":
						updateData.adminContactId =
							currentDomainData.registrantContactId; // Use registrant as fallback
						break;
					case "billing":
						updateData.billingContactId =
							currentDomainData.registrantContactId; // Use registrant as fallback
						break;
					case "technical":
					default:
						updateData.techContactId =
							currentDomainData.registrantContactId; // Use registrant as fallback
				}

				console.log(
					"ConnectReseller domain updateData =======>",
					updateData
				);
				const updateDomainRes = await domainProviderApiClient.request(
					"ModifyDomainContact",
					updateData,
					"post",
					provider
				);

				console.log(
					"ConnectReseller updateDomainRes =======>",
					updateDomainRes
				);

				return res.json({
					message: `${contactType} contact deleted and replaced with registrant contact successfully`,
					result: deleteRes,
					note: "Contact was deleted and replaced with the registrant contact to maintain domain compliance",
				});
			}
		} catch (error) {
			console.error(`Error deleting ${contactType} contact:`, error);
			throw new BadRequestError(
				`Failed to delete ${contactType} contact`
			);
		}
	}
}

module.exports = DomainContactController;
