package it.polimi.tiw.servlets.api;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.thymeleaf.context.WebContext;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import it.polimi.tiw.beans.Album;
import it.polimi.tiw.beans.Comment;
import it.polimi.tiw.beans.Image;
import it.polimi.tiw.beans.Person;
import it.polimi.tiw.dao.AlbumDAO;
import it.polimi.tiw.dao.CommentDAO;
import it.polimi.tiw.dao.ImageDAO;
import it.polimi.tiw.servlets.DataServlet;
import it.polimi.tiw.utils.CreateAlbumUtility;
import it.polimi.tiw.utils.GeneralUtility;
import it.polimi.tiw.utils.JsonUtility;

@WebServlet("/deleteImage")
public class DeleteImageServlet extends ApiServlet {
    private static final long serialVersionUID = -7397515526960117146L;
    private Gson gson = new Gson();
    
	public DeleteImageServlet() {
        super();
    }
	
	public void init() throws ServletException {
		super.init();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		setJsonContent(response);
		Person user = (Person) request.getSession().getAttribute("user");		

		String imgParameter = request.getParameter("imgId");
		
		if (!GeneralUtility.isValidNumericParameter(imgParameter)) {
			System.out.println(imgParameter);
			badRequestResponse(response, "The image ID is wrong");
			return;
		}
		Integer imgId = Integer.parseInt(imgParameter);
		Optional<Comment> c;
		Optional<Image> img;
		try {
			ImageDAO imageDAO = new ImageDAO(this.dbConnection);
			AlbumDAO albumDAO = new AlbumDAO(this.dbConnection);
			img = imageDAO.get(imgId);
			if (img.isPresent()) {
				if (img.get().getUploaderId() == user.getId()) {
					imageDAO.delete(img.get());
					albumDAO.deleteEmptyAlbums();
					goodRequestResponse(response, JsonUtility.mapToJson(img.get()));
					return;
				} else {
					badRequestResponse(response, "The user is not the uploader of the image", 403);
				}
			} else {
				badRequestResponse(response, "The given image does not exist", 404);
				return;			
			}
		} catch (SQLException e) {
			badRequestResponse(response, "Could not connect to the database", 500);
			return;
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
}
