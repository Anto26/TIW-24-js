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

@WebServlet("/addComment")
public class AddCommentServlet extends ApiServlet {
    private static final long serialVersionUID = -7397515526960117146L;
    private ImageDAO imageDAO;
    private CommentDAO commentDAO;
    
	public AddCommentServlet() {
        super();
    }
	
	public void init() throws ServletException {
		super.init();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		setJsonContent(response);
		Person user = (Person) request.getSession().getAttribute("user");		

		String imgParameter = request.getParameter("imgId");
		String text = request.getParameter("text");

		if (!GeneralUtility.isValidNumericParameter(imgParameter) || text == null || text.equals("") ) {
			badRequestResponse(response, "The text of the comment is not correct or the image ID is wrong");
			return;
		}
		Integer imgId = Integer.parseInt(imgParameter);
		Optional<Comment> c;
		try {
			imageDAO = new ImageDAO(this.dbConnection);
			commentDAO = new CommentDAO(this.dbConnection);
			Optional<Image> img = imageDAO.get(imgId);
			if (img.isPresent()) {
				if (text.length() > 4096) {
					badRequestResponse(response, "The text of the comment is too long");
					return;
				}
				c = commentDAO.save(text, String.valueOf(imgId), String.valueOf(user.getId()));
			} else {
				badRequestResponse(response, "The given image does not exist", 404);
				return;			
			}
		} catch (SQLException e) {
			badRequestResponse(response, "Could not connect to the database", 500);
			return;
		}
		goodRequestResponse(response, JsonUtility.mapToJson(c.get()));
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
	
	public void destroy() {
		super.destroy();
		try {
			if (this.commentDAO != null) {
				this.commentDAO.close();
			}
			if (this.imageDAO != null) {
				this.imageDAO.close();
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
